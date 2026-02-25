from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
import uuid

import models
import schemas
from database import engine, get_db
from redis_client import redis_client
from tasks import send_email_task


# =============================
# CREATE TABLES
# =============================

models.Base.metadata.create_all(bind=engine)

app = FastAPI()


# =============================
# CORS
# =============================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================
# JWT CONFIG
# =============================

SECRET_KEY = "supersecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =============================
# UTILITY FUNCTIONS
# =============================

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# =============================
# AUTH ROUTES
# =============================

@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = models.User(
        email=user.email,
        password=hash_password(user.password),
        role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = db.query(models.User).filter(
        models.User.email == form_data.username
    ).first()

    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }


# =============================
# AUTH HELPERS
# =============================

def get_current_user(token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401)

    user = db.query(models.User).filter(
        models.User.email == email
    ).first()

    if not user:
        raise HTTPException(status_code=401)

    return user


def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# =============================
# EVENTS
# =============================

@app.post("/events", response_model=schemas.EventResponse)
def create_event(event: schemas.EventCreate,
                 db: Session = Depends(get_db),
                 current_user: models.User = Depends(require_admin)):

    new_event = models.Event(
        name=event.name,
        total_seats=event.total_seats,
        available_seats=event.total_seats
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@app.get("/events", response_model=List[schemas.EventResponse])
def get_events(db: Session = Depends(get_db)):
    return db.query(models.Event).all()


@app.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):

    event = db.query(models.Event).filter(
        models.Event.id == event_id
    ).first()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    active_ticket = db.query(models.Ticket).filter(
        models.Ticket.event_id == event_id,
        models.Ticket.is_cancelled == False
    ).first()

    if active_ticket:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete event with active bookings"
        )

    db.delete(event)
    db.commit()

    return {"message": "Event deleted successfully"}


# =============================
# BOOK TICKET
# =============================

@app.post("/tickets", response_model=schemas.TicketResponse)
def book_ticket(event_id: int,
                db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):

    lock_key = f"event_lock_{event_id}"
    lock_acquired = redis_client.set(lock_key, "locked", nx=True, ex=10)

    if not lock_acquired:
        raise HTTPException(status_code=400, detail="Seat temporarily locked")

    try:
        event = db.query(models.Event).filter(
            models.Event.id == event_id
        ).first()

        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        if event.available_seats <= 0:
            raise HTTPException(status_code=400, detail="No seats available")

        reference = "TKT-" + uuid.uuid4().hex[:8].upper()

        ticket = models.Ticket(
            event_id=event.id,
            user_id=current_user.id,
            reference_number=reference
        )

        event.available_seats -= 1

        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        send_email_task.delay(
            current_user.email,
            event.name,
            ticket.reference_number
        )

        return {
            "id": ticket.id,
            "event_name": event.name,
            "reference_number": ticket.reference_number
        }

    finally:
        redis_client.delete(lock_key)


# =============================
# CANCEL TICKET (SOFT DELETE)
# =============================

@app.delete("/tickets/{ticket_id}")
def cancel_ticket(ticket_id: int,
                  db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):

    ticket = db.query(models.Ticket).filter(
        models.Ticket.id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403)

    if ticket.is_cancelled:
        raise HTTPException(status_code=400, detail="Ticket already cancelled")

    ticket.is_cancelled = True

    event = db.query(models.Event).filter(
        models.Event.id == ticket.event_id
    ).first()

    if event:
        event.available_seats += 1

    db.commit()

    return {"message": "Ticket cancelled successfully"}


# =============================
# MY TICKETS
# =============================

@app.get("/my-tickets", response_model=List[schemas.TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):

    tickets = db.query(models.Ticket).filter(
        models.Ticket.user_id == current_user.id,
        models.Ticket.is_cancelled == False
    ).all()

    return [
        {
            "id": ticket.id,
            "event_name": ticket.event.name,
            "reference_number": ticket.reference_number
        }
        for ticket in tickets
    ]


# =============================
# ADMIN REPORT API (for dashboard)
# =============================

@app.get("/reports/total-bookings")
def total_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):

    count = db.query(models.Ticket).filter(
        models.Ticket.is_cancelled == False
    ).count()

    return {"total_bookings": count}


@app.get("/reports/event-wise")
def event_wise_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):

    results = (
        db.query(
            models.Event.name,
            func.count(models.Ticket.id).label("bookings")
        )
        .outerjoin(models.Ticket)
        .filter(models.Ticket.is_cancelled == False)
        .group_by(models.Event.name)
        .all()
    )

    return [
        {"event_name": r[0], "total_bookings": r[1]}
        for r in results
    ]


# =============================
# ADMIN PDF REPORT
# =============================

@app.get("/admin/report/{period}")
def download_admin_report(
    period: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):

    now = datetime.utcnow()

    if period == "weekly":
        start_date = now - timedelta(days=7)
    elif period == "monthly":
        start_date = now - timedelta(days=30)
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    tickets = db.query(models.Ticket).filter(
        models.Ticket.created_at >= start_date
    ).all()

    total_booked = len([t for t in tickets if not t.is_cancelled])
    total_cancelled = len([t for t in tickets if t.is_cancelled])

    event_data = {}

    for ticket in tickets:
        event_name = ticket.event.name

        if event_name not in event_data:
            event_data[event_name] = {"booked": 0, "cancelled": 0}

        if ticket.is_cancelled:
            event_data[event_name]["cancelled"] += 1
        else:
            event_data[event_name]["booked"] += 1

    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    p.setFont("Helvetica-Bold", 18)
    p.drawString(170, height - 50, "Admin Booking Report")

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 90, f"Period: {period.capitalize()}")
    p.drawString(50, height - 110, f"Total Bookings: {total_booked}")
    p.drawString(50, height - 130, f"Total Cancellations: {total_cancelled}")

    y = height - 170
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "Event-wise Breakdown")
    y -= 20

    p.setFont("Helvetica", 12)

    for event_name, data in event_data.items():
        p.drawString(
            50,
            y,
            f"{event_name} → Booked: {data['booked']} | Cancelled: {data['cancelled']}"
        )
        y -= 20

    p.showPage()
    p.save()

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={period}_report.pdf"
        }
    )
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


# =============================
# USER MODEL
# =============================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user")

    tickets = relationship("Ticket", back_populates="owner", cascade="all, delete")


# =============================
# EVENT MODEL
# =============================

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)

    tickets = relationship("Ticket", back_populates="event", cascade="all, delete")


# =============================
# TICKET MODEL
# =============================

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    reference_number = Column(String, unique=True, index=True, nullable=False)

    event_id = Column(Integer, ForeignKey("events.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    # Soft delete + tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    is_cancelled = Column(Boolean, default=False)

    # Relationships
    owner = relationship("User", back_populates="tickets")
    event = relationship("Event", back_populates="tickets")
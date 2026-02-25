
import os
import asyncio
from celery import Celery
from dotenv import load_dotenv
from email_utils import send_booking_email
from report_utils import generate_ticket_pdf  # make sure this exists

load_dotenv()

celery_app = Celery(
    "ticket_app",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")


@celery_app.task
def send_email_task(user_email, event_name, reference_number):
    print("🔥 Celery task started")

    # Generate PDF
    pdf_path = generate_ticket_pdf(
        event_name=event_name,
        user_email=user_email,
        reference_number=reference_number
    )

    # -------- USER EMAIL --------
    user_subject = "🎟 Ticket Booking Confirmation"
    user_message = f"""
Hello,

Your ticket has been successfully booked!

Event Name: {event_name}
Ticket Reference: {reference_number}

Please keep this reference number for future communication.

Regards,
Ticket Booking App
"""

    asyncio.run(
        send_booking_email(
            to_email=user_email,
            subject=user_subject,
            message=user_message,
            attachment_path=pdf_path
        )
    )

    # -------- ADMIN EMAIL --------
    if ADMIN_EMAIL:
        admin_subject = "📢 New Ticket Booking"
        admin_message = f"""
New booking received!

Booked User: {user_email}
Event: {event_name}
Reference: {reference_number}
"""

        asyncio.run(
            send_booking_email(
                to_email=ADMIN_EMAIL,
                subject=admin_subject,
                message=admin_message,
                attachment_path=pdf_path
            )
        )

    print("🔥 Celery task finished")
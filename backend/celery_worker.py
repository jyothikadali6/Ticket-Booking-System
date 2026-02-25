from celery import Celery

celery_app = Celery(
    "ticket_app",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Import tasks explicitly
import tasks

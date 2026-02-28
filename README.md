Ticket Booking System

A full-stack Ticket Booking Application built using scalable, real-world architecture.
This project demonstrates modern backend design using FastAPI, PostgreSQL, Redis, and Celery with a React frontend.
Tech Stack
🔹 Backend

  Python

  FastAPI

  Uvicorn

  PostgreSQL

  SQLAlchemy ORM

  Redis (Seat Locking)

  Celery (Background Tasks)

  JWT Authentication

  FastAPI-Mail (Email Service)

🔹 Frontend

  React.js
  
  Axios
  
  React Router
  
  React Toastify
  
  Custom Green-Red-White UI Theme

  Tailwind CSS

Features
  Authentication
  
  User Registration
  
  JWT-based Login
  
  Role-based Authorization (Admin / User)
  
  Protected Routes
  
  Event Management
  
  Admin can create events
  
  Event Image URL support
  
  Event deletion (prevents deletion if bookings exist)
  
  View all events
  
  Seat Booking
  
  Redis-based seat locking (prevents double booking)
  
  Seat availability tracking
  
  Booking confirmation via email
  
  Background email processing using Celery

Reports & Analytics
  
  Total bookings
  
  Event-wise booking report
  
  User booking history
  
  Admin dashboard analytics

Email Notifications

  Booking confirmation sent to:
  
  User
  
  Admin
  
  Powered by Celery + FastAPI-Mail
Architecture Overview
User
  ↓
React Frontend
  ↓
FastAPI Backend
  ↓
PostgreSQL (Data Storage)
  ↓
Redis (Seat Locking)
  ↓
Celery Worker
  ↓
Email Service



🔒 Security Features

JWT Authentication

Role-based access control

Redis locking to prevent race conditions

Database-level integrity using PostgreSQL

Admin-only event management

📂 Project Structure
backend/
│
├── main.py
├── models.py
├── schemas.py
├── database.py
├── redis_client.py
├── tasks.py
├── email_utils.py
├── celery_worker.py
└── .env

frontend/
│
├── pages/
│   ├── Login.js
│   ├── Register.js
│   ├── Events.js
│   ├── Admin.js
│   └── MyTickets.js
│
├── components/
│   ├── Layout.js
│   └── ProtectedRoute.js
│
├── api.js
└── App.js

⚙️ Installation Guide
1️⃣ Clone Repository
git clone <your-repository-link>
cd ticket-booking-system

2️⃣ Backend Setup
Create virtual environment:

python -m venv venv
venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

3️⃣ Setup PostgreSQL

Create database:

CREATE DATABASE ticketdb;

Update .env file:

DATABASE_URL=postgresql://postgres:password@127.0.0.1:5432/ticketdb
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password

4️⃣ Start Redis
redis-server
5️⃣ Start Celery Worker
celery -A celery_worker.celery_app worker --loglevel=info
6️⃣ Run Backend
uvicorn main:app --reload

Backend runs at:

http://localhost:8000

Swagger Docs:

http://localhost:8000/docs
7️⃣ Frontend Setup
cd frontend
npm install
npm start

Frontend runs at:

http://localhost:3000
🧪 Sample Test Flow

Register a user

Login

Admin creates event

User books ticket

Redis locks seat

Email sent in background

Admin sees booking report

📈 Future Improvements

Docker & Docker Compose setup

Alembic database migrations

Payment gateway integration

Seat layout selection UI

Pagination & search

Cloud image upload (Cloudinary / AWS S3)

Real-time notifications (WebSockets)

🏆 Why This Project Is Production-Ready

Uses scalable microservice-style architecture

Prevents double booking using Redis

Uses background processing (Celery)

Implements JWT security

Role-based access control

Clean folder structure

Professional UI

👩‍💻 Author

Jyothi Durga Kadali
BTech – Information Technology
Aspiring Software Developer

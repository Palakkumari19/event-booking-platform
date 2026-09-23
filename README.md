# 🎟️ Event Booking Platform

A full-stack event booking platform where users can discover events, reserve seats, make payments, and receive digital tickets with QR codes.

Built with a focus on **concurrency-safe seat booking**, role-based access, and a complete organizer-to-attendee booking flow.

---

## ✨ Highlights

- 🔐 **JWT Authentication** — Secure login with Attendee, Organizer, and Admin roles
- 🎭 **Event Management** — Organizers can create, edit, publish, and cancel events
- 💺 **Redis Seat Locking** — Temporary seat holds prevent double booking during checkout
- 💳 **Payment Integration** — Razorpay payment, verification, and refund workflow
- 🎫 **Digital Tickets** — Automatic ticket generation with QR codes
- 🔍 **Event Discovery** — Search, venue filtering, upcoming events, and seat availability
- 🔔 **Notifications** — In-app booking and event notifications
- ⚡ **Background Tasks** — Celery for asynchronous processing

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Django, Django REST Framework, Channels |
| Database | PostgreSQL |
| Caching & Locking | Redis |
| Background Tasks | Celery |
| Authentication | JWT |
| Payments | Razorpay |

---

## 🔄 Booking Flow

```text
Browse Events
     ↓
Select Seat
     ↓
Redis Seat Lock
     ↓
Checkout
     ↓
Payment Verification
     ↓
Booking Confirmed
     ↓
QR Ticket Generated

🔒 Concurrency-Safe Booking
Redis temporarily locks a selected seat during checkout.
If another user tries to select the same seat while it is locked, the seat remains unavailable until the lock expires or the booking is completed.
This was tested using multiple browser sessions to verify that the same seat cannot be acquired concurrently.
👥 User Roles
Attendee
Browse and search events
Select seats
Book tickets
Make payments
View bookings and tickets
Organizer
Create and manage events
Configure ticket sections and pricing
Publish or cancel events
View organizer dashboard
Admin
Administrative access through Django
🚀 Run Locally
Backend
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
Frontend
cd frontend

npm install
npm run dev
Make sure PostgreSQL and Redis are running and configure your environment variables in:
backend/.env
For Celery:
cd backend
celery -A config worker --loglevel=info
📁 Project Structure
EventBookingPlatform/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── bookings/
│   │   ├── events/
│   │   ├── venues/
│   │   ├── payments/
│   │   ├── tickets/
│   │   └── notifications/
│   └── config/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       └── pages/
│
└── docs/
🧪 Tested End-to-End
The main application flows have been tested locally, including:
Authentication & role-based access
Event creation and publishing
Seat selection and Redis locking
Concurrent seat booking
Payment and booking confirmation
Ticket and QR generation
Ticket validation
Organizer event management
👤 Author
Palak Kumari
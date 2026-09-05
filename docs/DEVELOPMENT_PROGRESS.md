````markdown
# Event Booking Platform

> Full-stack event booking and ticketing platform built with Django REST Framework, PostgreSQL, Redis, Celery, Razorpay, React, Vite, and Tailwind CSS.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [System Architecture](#4-system-architecture)
5. [Authentication](#5-authentication)
6. [Venue Management](#6-venue-management)
7. [Event Management](#7-event-management)
8. [Event Sections and Pricing](#8-event-sections-and-pricing)
9. [Seat Selection and Redis Holds](#9-seat-selection-and-redis-holds)
10. [Booking System](#10-booking-system)
11. [Booking Validation and Concurrency](#11-booking-validation-and-concurrency)
12. [Celery and Automatic Booking Cleanup](#12-celery-and-automatic-booking-cleanup)
13. [Payment System](#13-payment-system)
14. [Razorpay Payment Flow](#14-razorpay-payment-flow)
15. [Payment Verification](#15-payment-verification)
16. [Ticket Generation](#16-ticket-generation)
17. [Booking Cancellation and Refunds](#17-booking-cancellation-and-refunds)
18. [Frontend Checkout Flow](#18-frontend-checkout-flow)
19. [Bugs Identified and Fixed](#19-bugs-identified-and-fixed)
20. [API Endpoints](#20-api-endpoints)
21. [Database and State Management](#21-database-and-state-management)
22. [Testing and Verified Functionality](#22-testing-and-verified-functionality)
23. [Current Status](#23-current-status)
24. [Next Steps](#24-next-steps)

---

# 1. Project Overview

The Event Booking Platform is a full-stack application for discovering events, selecting seats, temporarily holding seats, creating bookings, processing online payments, generating tickets, and handling booking cancellations and refunds.

The platform is designed to handle important real-world booking concerns such as:

- Concurrent seat selection
- Temporary seat reservations
- Duplicate booking prevention
- Booking expiration
- Background cleanup
- Secure payment verification
- Payment state management
- Refund processing
- Duplicate refund prevention
- Ticket generation
- Authenticated user access

The backend is responsible for business rules and data integrity, while the React frontend provides the user-facing booking experience.

---

# 2. Technology Stack

## Backend

| Technology | Purpose |
|---|---|
| Python | Backend programming language |
| Django 6.0.7 | Web framework |
| Django REST Framework | REST API development |
| PostgreSQL | Primary relational database |
| Redis | Seat holds, caching, and Celery infrastructure |
| Celery 5.6.3 | Background task processing |
| Celery Beat | Periodic task scheduling |
| Django Channels | Real-time/websocket infrastructure |
| Razorpay | Online payment processing |

## Frontend

| Technology | Purpose |
|---|---|
| React | Frontend framework |
| Vite | Frontend build/development tooling |
| Tailwind CSS | Styling |
| JavaScript | Frontend programming language |

## Authentication

| Technology | Purpose |
|---|---|
| Custom Django User | Email-based user accounts |
| JWT | Authentication between frontend and backend |

---

# 3. Project Structure

```text
backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   ├── wsgi.py
│   ├── celery.py
│   └── __init__.py
│
├── apps/
│   ├── accounts/
│   ├── bookings/
│   ├── events/
│   ├── venues/
│   ├── payments/
│   └── tickets/
│
├── manage.py
└── requirements.txt

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
│
└── package.json

docs/
└── DEVELOPMENT_PROGRESS.md
````

---

# 4. System Architecture

The application currently follows this general architecture:

```text
                         ┌─────────────────────┐
                         │      React UI       │
                         │   Vite + Tailwind   │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │ Django REST API     │
                         │      Backend        │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
           ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
           │ PostgreSQL  │   │    Redis    │   │  Razorpay   │
           │  Database   │   │ Cache/Holds │   │     API     │
           └─────────────┘   └─────────────┘   └─────────────┘
                                    │
                                    │
                                    ▼
                            ┌─────────────┐
                            │   Celery    │
                            │    Beat     │
                            └─────────────┘
```

### Responsibilities

**React**

* Event browsing
* Seat selection
* Checkout
* Payment interaction
* Booking status
* Ticket access

**Django / DRF**

* Authentication
* Business logic
* Booking validation
* Seat validation
* Payment processing
* Ticket creation
* Cancellation and refunds

**PostgreSQL**

* Persistent application data
* Users
* Events
* Venues
* Seats
* Bookings
* Payments
* Tickets

**Redis**

* Temporary seat holds
* Cache
* Celery broker/result backend separation

**Celery**

* Background processing
* Automatic stale booking cleanup

**Razorpay**

* Payment links
* Payment status
* Payment verification
* Refunds

---

# 5. Authentication

A custom Django User model has been implemented.

Users authenticate using their email address rather than a traditional username.

The login flow is:

```text
Email + Password
       ↓
Django Authentication
       ↓
JWT Access Token
       +
JWT Refresh Token
       ↓
Frontend uses Access Token
       ↓
Protected API Requests
```

## Implemented functionality

* User registration
* User login
* JWT access tokens
* JWT refresh tokens
* Authenticated user information
* Protected API endpoints
* Email-based authentication

---

# 6. Venue Management

The venue structure is hierarchical:

```text
Venue
  │
  ├── Section
  │     ├── Seat
  │     ├── Seat
  │     └── Seat
  │
  ├── Section
  │     ├── Seat
  │     └── Seat
  │
  └── Section
        └── Seat
```

## Venue

Represents the physical location where events take place.

## Section

Represents a seating section within a venue.

Examples could include:

* VIP
* Premium
* General
* Balcony

## Seat

Represents an individual bookable seat.

Seats contain information such as:

* Row
* Seat number
* Section
* Active/inactive state
* Venue relationship

---

# 7. Event Management

Events are associated with a venue.

An event contains:

* Title
* Venue
* Booking start time
* Booking end time
* Status
* Other event information

## Event statuses

```text
DRAFT
PUBLISHED
CANCELLED
COMPLETED
```

Only `PUBLISHED` events are available for normal seat booking.

The booking system also verifies that the current time falls within the configured booking window.

---

# 8. Event Sections and Pricing

Events use the venue's sections through the `EventSection` relationship.

```text
Event
  │
  ├── EventSection
  │      ├── Section
  │      └── Price
  │
  └── EventSection
         ├── Section
         └── Price
```

This allows the same venue to host different events with different section prices.

For example:

```text
Event A
├── VIP       → ₹2000
├── Premium   → ₹1200
└── General   → ₹700
```

The backend determines the price from the event and seat's section instead of trusting a price sent by the frontend.

---

# 9. Seat Selection and Redis Holds

A seat is not immediately converted into a permanent booking when a user selects it.

Instead, the application first creates a temporary Redis hold.

The flow is:

```text
User selects seat
       ↓
Backend validates seat
       ↓
Redis hold created
       ↓
Seat temporarily belongs to user
       ↓
User proceeds to checkout
       ↓
Booking created
       ↓
Redis hold released
```

## Redis configuration

Redis is separated into different databases:

```text
Redis DB 0
→ Celery broker/result backend

Redis DB 1
→ Django cache
→ Temporary seat holds
```

## Seat hold key

Seat holds use keys in the format:

```text
seat_hold:{event_id}:{seat_id}
```

## Hold duration

Current hold duration:

```text
300 seconds
```

which is:

```text
5 minutes
```

---

# 10. Booking System

The booking model represents a user's reservation of a specific seat for an event.

## Booking statuses

```text
PENDING
CONFIRMED
CANCELLED
```

## Booking relationships

```text
User
  │
  └── Booking
        ├── Event
        └── Seat
```

A booking contains:

* User
* Event
* Seat
* Status
* Booking timestamp

---

# 11. Booking Validation and Concurrency

The booking system performs several validations before creating a booking.

## Seat validation

The backend checks that:

* The seat exists.
* The seat belongs to the event's venue.
* The seat is active.
* The event is published.
* The booking window is open.

## Redis ownership validation

The user must currently hold the seat in Redis.

This prevents another user from creating a booking for a seat they do not currently control.

## Existing booking validation

The system checks for an existing active booking.

Active booking statuses are:

```text
PENDING
CONFIRMED
```

---

## Database-level duplicate prevention

A conditional unique constraint prevents the same seat from being actively booked multiple times for the same event.

Conceptually:

```text
Event + Seat
      ↓
PENDING or CONFIRMED
      ↓
Must be unique
```

A cancelled booking does not permanently block the seat.

---

## Transaction locking

Booking creation uses database transactions and row-level locking.

The event is locked using:

```python
select_for_update()
```

This helps prevent race conditions when multiple users attempt to book seats at the same time.

---

# 12. Celery and Automatic Booking Cleanup

Celery is configured with Redis.

## Celery configuration

```text
CELERY_BROKER_URL
CELERY_RESULT_BACKEND
CELERY_ACCEPT_CONTENT
CELERY_TASK_SERIALIZER
CELERY_RESULT_SERIALIZER
CELERY_TIMEZONE
CELERY_ENABLE_UTC
```

## Pending booking timeout

The application currently uses:

```text
PENDING_BOOKING_TIMEOUT = 300 seconds
```

## Celery Beat schedule

The cleanup task runs every:

```text
60 seconds
```

The task identifies stale bookings using:

```text
status = PENDING
```

and:

```text
booked_at < current_time - 300 seconds
```

Those bookings are automatically cancelled.

---

## Why this is necessary

Without automatic cleanup:

```text
User selects seat
      ↓
Booking created
      ↓
User leaves checkout
      ↓
Booking remains PENDING forever
      ↓
Seat remains unavailable
```

With Celery:

```text
User leaves checkout
      ↓
Booking remains PENDING
      ↓
5 minutes pass
      ↓
Celery detects stale booking
      ↓
Booking → CANCELLED
      ↓
Seat becomes available
```

---

# 13. Payment System

Razorpay Payment Links are currently used for online payments.

## Payment statuses

```text
CREATED
SUCCESS
FAILED
REFUNDED
```

Each booking has at most one payment through a one-to-one relationship.

The Payment model stores:

* Booking
* Razorpay Payment Link ID
* Razorpay Payment ID
* Razorpay signature
* Razorpay refund ID
* Amount
* Status
* Created timestamp
* Updated timestamp

---

# 14. Razorpay Payment Flow

The current end-to-end payment flow is:

```text
User selects seat
       ↓
Seat is held in Redis
       ↓
Booking created as PENDING
       ↓
Razorpay Payment Link created
       ↓
User completes payment
       ↓
Frontend checks payment status
       ↓
Razorpay reports Payment Link as PAID
       ↓
Actual Razorpay payment ID extracted
       ↓
Payment marked SUCCESS
       ↓
Booking confirmed
       ↓
Ticket created
```

## Payment creation

The backend:

1. Finds the user's booking.
2. Verifies that it is `PENDING`.
3. Prevents duplicate payments.
4. Retrieves the event-section price.
5. Creates a Razorpay Payment Link.
6. Stores the Payment Link ID in the Payment model.

The current payment reference is stored in:

```text
Payment.razorpay_order_id
```

The value currently represents the Razorpay Payment Link ID.

---

# 15. Payment Verification

Two mechanisms are implemented for payment confirmation.

## Payment Link status checking

The current frontend flow primarily uses:

```text
POST /api/payments/status/
```

The backend fetches the Razorpay Payment Link and checks:

```text
payment_link.status == "paid"
```

After a successful payment, the backend reads the Payment Link's payment information and extracts the actual:

```text
pay_...
```

Razorpay payment ID.

That ID is stored in:

```text
Payment.razorpay_payment_id
```

This is important because refunds require the actual Razorpay payment ID.

---

## Razorpay signature verification

A separate verification endpoint is also implemented.

The backend verifies:

```text
razorpay_order_id
razorpay_payment_id
razorpay_signature
```

using Razorpay's signature verification mechanism.

After successful verification:

```text
Payment → SUCCESS
Booking → CONFIRMED
Ticket → CREATED
```

---

# 16. Ticket Generation

A ticket is automatically created after successful payment and booking confirmation.

The system checks whether the booking already has a ticket before creating one.

This prevents duplicate ticket creation when:

* Payment status is checked multiple times.
* The frontend retries a request.
* The user refreshes the checkout page.

The normal flow is:

```text
Payment SUCCESS
      ↓
Booking CONFIRMED
      ↓
Ticket exists?
   ↙       ↘
 YES        NO
  ↓          ↓
Nothing   Create Ticket
```

---

# 17. Booking Cancellation and Refunds

Booking cancellation has been integrated with the payment system.

For a confirmed booking:

```text
CONFIRMED BOOKING
       ↓
Cancellation requested
       ↓
Payment exists?
       ↓
Payment SUCCESS?
       ↓
Refund through Razorpay
       ↓
Booking → CANCELLED
```

If the payment has already been refunded, another refund is not created.

---

## Refund validation

The refund service requires:

```text
Payment.status = SUCCESS
```

and:

```text
Payment.razorpay_payment_id
```

The backend then fetches the actual Razorpay payment and verifies that:

```text
Razorpay payment status = captured
```

Only then is the refund requested.

---

## Refund amount

The refund amount is calculated from the stored payment amount and converted into the smallest currency unit required by Razorpay.

For INR:

```text
₹100
```

becomes:

```text
10000 paise
```

---

## Refund ID

After a successful refund, Razorpay returns a refund identifier:

```text
rfnd_...
```

This is stored in:

```text
Payment.razorpay_refund_id
```

The payment status then becomes:

```text
REFUNDED
```

---

# 18. Refund Idempotency

Refunds use a deterministic idempotency key:

```text
booking-refund-{booking_id}
```

The purpose is to prevent duplicate refunds if the application retries a request.

Example:

```text
First request
    ↓
Razorpay processes refund
    ↓
Network failure before response reaches server
    ↓
Server retries
    ↓
Same idempotency key
    ↓
Razorpay does not create a duplicate refund
```

The application also checks:

```text
if payment.status == REFUNDED
```

before attempting another refund.

---

# 19. Frontend Checkout Flow

The current frontend checkout process is:

```text
Event Page
    ↓
Seat Selection
    ↓
Hold Seat
    ↓
Checkout Page
    ↓
Create Booking
    ↓
Create Razorpay Payment Link
    ↓
Open Payment Link
    ↓
User completes payment
    ↓
"I've completed payment"
    ↓
Check Payment Status
    ↓
Booking Confirmed
    ↓
Ticket Created
    ↓
My Tickets
```

---

## Checkout session storage

The frontend temporarily stores checkout information using `sessionStorage`.

Current values include:

```text
checkout_event_id
checkout_seat_id
checkout_seat
checkout_hold_expires_in
checkout_booking_id
```

---

# 20. Bugs Identified and Fixed

## Bug 1 — Stale checkout booking ID

### Problem

The frontend could retain an old:

```text
checkout_booking_id
```

when the user selected a new seat.

This meant the checkout page could accidentally attempt to reuse an old booking.

If that booking had already been cancelled by Celery, payment creation failed with:

```text
Payment can only be created for a pending booking.
```

### Fix

When a new seat is successfully held:

```javascript
sessionStorage.removeItem("checkout_booking_id");
```

The next checkout therefore creates a new booking instead of reusing stale state.

---

## Bug 2 — Missing Razorpay Payment ID

### Problem

The Payment Link status was correctly detected as:

```text
paid
```

However, the backend originally only changed:

```text
Payment.status → SUCCESS
```

and did not save the actual:

```text
pay_...
```

Razorpay payment ID.

This meant the refund service could not identify the payment to refund.

### Fix

The payment status flow now reads the payment information returned by the Razorpay Payment Link and stores:

```text
Payment.razorpay_payment_id
```

The refund flow can therefore use the actual Razorpay payment ID.

---

# 21. API Endpoints

## Authentication

Authentication endpoints have been implemented for:

```text
Register
Login
Token Refresh
Current User
```

---

## Booking APIs

```http
GET    /api/bookings/seats/?event=<event_id>
POST   /api/bookings/
GET    /api/bookings/my-bookings/
PATCH  /api/bookings/<booking_id>/cancel/
POST   /api/bookings/hold/
GET    /api/bookings/hold-status/
```

---

## Payment APIs

```http
POST /api/payments/create-order/
POST /api/payments/verify/
POST /api/payments/status/
```

> Note: `/create-order/` is currently named for compatibility with the existing API structure, but the implementation creates a Razorpay Payment Link.

---

# 22. Database and State Management

The main application state is divided between PostgreSQL and Redis.

## PostgreSQL

Persistent data:

```text
Users
Venues
Sections
Seats
Events
EventSections
Bookings
Payments
Tickets
```

## Redis

Temporary/high-speed state:

```text
Seat Holds
Django Cache
Celery Broker
Celery Results
```

The Redis databases are separated:

```text
DB 0 → Celery
DB 1 → Django cache / seat holds
```

---

# 23. Important Booking State Transitions

## Normal booking

```text
                ┌──────────────┐
                │ Seat Selected│
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │ Redis Hold   │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │   PENDING    │
                └──────┬───────┘
                       ↓
                  Payment
                       ↓
                ┌──────────────┐
                │  CONFIRMED   │
                └──────┬───────┘
                       ↓
                ┌──────────────┐
                │    Ticket    │
                └──────────────┘
```

## Expired booking

```text
PENDING
   ↓
5 minutes without completion
   ↓
Celery detects stale booking
   ↓
CANCELLED
```

## Cancellation after successful payment

```text
CONFIRMED
   ↓
Payment SUCCESS
   ↓
Razorpay refund
   ↓
Payment REFUNDED
   ↓
Booking CANCELLED
```

---

# 24. Testing and Verified Functionality

The following functionality has been tested successfully.

## Backend validation

```bash
python manage.py check
```

Result:

```text
System check identified no issues (0 silenced).
```

---

## Celery worker

Celery worker has been started successfully and is processing tasks.

---

## Celery Beat

Celery Beat has been configured and verified to trigger the stale booking cleanup task.

---

## Stale booking cleanup

A pending booking was allowed to become stale.

The final state was verified as:

```text
BOOKING STATUS: CANCELLED
PAYMENT STATUS: CREATED
HAS TICKET: False
ACTIVE BOOKING: False
```

This confirmed that stale pending bookings are automatically cancelled.

---

## Cancelled booking confirmation protection

An attempt was made to confirm a cancelled booking.

The backend correctly rejected the operation with:

```text
This booking has been cancelled and cannot be confirmed.
```

This confirms that cancelled bookings cannot be resurrected.

---

## Successful Razorpay payment

A real Razorpay test payment was successfully processed.

Verified database state:

```text
Booking: CONFIRMED
Payment: SUCCESS
Razorpay Payment ID: pay_TYSZ2Ma4oMlLbv
Refund ID: None
Ticket: Created
```

This confirms that:

* Razorpay payment succeeded.
* The booking was confirmed.
* The actual Razorpay payment ID was stored.
* A ticket was created.
* The payment is ready for the refund flow.

---

# 25. Current Status

## Completed

### Backend

* [x] Django project setup
* [x] PostgreSQL integration
* [x] Redis integration
* [x] Custom User model
* [x] Email-based authentication
* [x] JWT authentication
* [x] Venue model
* [x] Section model
* [x] Seat model
* [x] Event model
* [x] Event status management
* [x] EventSection pricing
* [x] Booking model
* [x] Booking validation
* [x] Database-level active booking constraint
* [x] Transaction-based booking creation
* [x] Row-level locking
* [x] Redis seat holds
* [x] Hold ownership validation
* [x] Booking APIs
* [x] Celery configuration
* [x] Celery Beat
* [x] Stale booking cleanup
* [x] Booking confirmation protection
* [x] Razorpay integration
* [x] Razorpay Payment Links
* [x] Payment model
* [x] Payment status checking
* [x] Razorpay payment ID persistence
* [x] Razorpay signature verification
* [x] Ticket creation
* [x] Booking cancellation
* [x] Razorpay refund service
* [x] Refund state management
* [x] Refund idempotency

### Frontend

* [x] React application
* [x] Vite setup
* [x] Tailwind CSS
* [x] Authentication flow
* [x] Event/seat interaction
* [x] Seat selection
* [x] Redis seat hold integration
* [x] Checkout flow
* [x] Razorpay Payment Link integration
* [x] Payment status checking
* [x] Session storage checkout state
* [x] Stale booking ID fix

### Testing

* [x] Django system checks
* [x] Redis connectivity
* [x] Celery worker
* [x] Celery Beat
* [x] Stale booking cancellation
* [x] Cancelled booking confirmation protection
* [x] Fresh booking creation
* [x] Razorpay Payment Link creation
* [x] Successful test payment
* [x] Razorpay payment ID persistence
* [x] Ticket creation after successful payment

---

# 26. Next Steps

The next immediate milestone is to complete and verify the cancellation/refund lifecycle.

## Step 1 — Cancel a confirmed paid booking

Use a booking that currently has:

```text
Booking = CONFIRMED
Payment = SUCCESS
razorpay_payment_id = pay_...
```

---

## Step 2 — Trigger cancellation

```http
PATCH /api/bookings/<booking_id>/cancel/
```

---

## Step 3 — Verify local database state

Expected:

```text
BOOKING: CANCELLED
PAYMENT: REFUNDED
RAZORPAY PAYMENT ID: pay_...
REFUND ID: rfnd_...
```

---

## Step 4 — Verify Razorpay refund

Confirm that the refund was successfully created by Razorpay.

---

## Step 5 — Test cancellation idempotency

Attempt to cancel the same booking again.

The system should not create another refund.

---

## Step 6 — Review ticket behavior

After cancellation/refund, determine how the ticket should behave.

The current implementation creates a ticket when payment succeeds, but cancellation does not yet explicitly remove or invalidate the ticket.

This should be finalized as part of the cancellation/ticket lifecycle.

---

# 27. Current End-to-End Architecture

The platform currently supports the following complete path:

```text
┌───────────────────┐
│       USER        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   React Frontend  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Seat Selection  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Redis Hold      │
│     5 minutes     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Pending Booking   │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Razorpay Payment  │
│       Link        │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Payment Completed │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Payment SUCCESS   │
│ pay_XXXXXXXX      │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Booking CONFIRMED │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Ticket Created   │
└───────────────────┘
```

Cancellation/refund extends this flow to:

```text
CONFIRMED BOOKING
        │
        ▼
Cancellation
        │
        ▼
Payment SUCCESS
        │
        ▼
Razorpay CAPTURED
        │
        ▼
Refund Requested
        │
        ▼
Payment REFUNDED
        │
        ▼
Booking CANCELLED
```

---

# 28. Development Milestone

At this stage, the core booking and payment foundation is implemented and tested.

The application now has:

```text
Authentication
      +
Event Management
      +
Venue & Seat Management
      +
Redis Seat Locking
      +
Transactional Booking
      +
Celery Cleanup
      +
Razorpay Payments
      +
Payment Verification
      +
Ticket Generation
      +
Refund Infrastructure
```

The next milestone is to complete the **live cancellation → Razorpay refund → ticket lifecycle** testing before moving on to additional features.

```
```

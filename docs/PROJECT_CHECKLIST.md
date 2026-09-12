# Event Booking Platform — Checklist

## Phase 1 — Core Booking System ✅

### Backend
- [x] Django + DRF
- [x] PostgreSQL
- [x] Custom email-based authentication + JWT
- [x] Users, venues, sections, seats
- [x] Events + event status
- [x] Event sections + pricing
- [x] Booking windows
- [x] Seat availability API
- [x] Redis seat holds (5 minutes)
- [x] Maximum 4 holds per user
- [x] Booking creation
- [x] Active-booking database uniqueness
- [x] Transaction/row locking
- [x] Booking cancellation
- [x] Celery stale-booking cleanup
- [x] Razorpay Payment Links
- [x] Payment verification/status
- [x] Razorpay signature verification
- [x] Razorpay refunds + idempotency
- [x] Ticket generation + QR data
- [x] My Bookings API
- [x] My Tickets API

### Frontend
- [x] React + Vite + Tailwind
- [x] Authentication
- [x] Navigation/protected flow
- [x] Event listing/details
- [x] Booking-window UI
- [x] Seat selection + hold countdown
- [x] Checkout + Razorpay
- [x] My Bookings + cancellation
- [x] My Tickets + ticket details

### Tested/Fixes
- [x] Authentication
- [x] Seat holding
- [x] Booking creation
- [x] Celery stale-booking cleanup
- [x] Payment success
- [x] Ticket generation
- [x] Cancellation + Razorpay refund
- [x] Open/closed booking-window UI
- [x] Fixed Razorpay refund URL
- [x] Fixed cancelled-booking validation
- [x] Fixed stale checkout booking ID
- [x] Fixed My Tickets route
- [x] Added My Bookings page

---

# Remaining Work

## Phase 2 — Admin / Event Management
- [ ] Configure Django Admin
- [ ] Manage venues, sections and seats
- [ ] Create/edit events
- [ ] Configure prices and booking windows
- [ ] Publish/cancel/complete events
- [ ] Validate event status transitions

## Phase 3 — Booking & Payment Edge Cases
- [ ] Failed payment handling
- [ ] Payment retry
- [ ] Expired hold handling
- [ ] Duplicate payment/verification protection
- [ ] Successful payment after booking cancellation
- [ ] Refund recovery/idempotency edge cases

## Phase 4 — Ticket Improvements
- [ ] Better ticket detail page
- [ ] QR ticket validation
- [ ] ACTIVE → USED ticket status
- [ ] Prevent ticket reuse

## Phase 5 — Notifications
- [ ] Booking confirmation email
- [ ] Cancellation/refund email
- [ ] Event reminder using Celery

## Phase 6 — Event Discovery
- [ ] Search events
- [ ] City/date/price/category filters
- [ ] Basic sorting

## Phase 7 — Testing
- [ ] Model tests
- [ ] Service tests
- [ ] API tests
- [ ] Permission/ownership tests
- [ ] Seat concurrency tests
- [ ] Payment/refund tests

## Phase 8 — Basic Security
- [ ] Verify API permissions
- [ ] Verify booking/ticket ownership
- [ ] `.env` for secrets
- [ ] `.env.example`
- [ ] Review CORS/CSRF and production settings

## Phase 9 — UI Polish
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Payment failure UI
- [ ] Expired-hold UI
- [ ] Responsive checks

## Phase 10 — Final Documentation & Viva
- [ ] README
- [ ] ER diagram
- [ ] System architecture diagram
- [ ] API documentation
- [ ] Project report
- [ ] Viva/interview preparation

---

# Commands Used So Far

## Backend
```bash
cd backend
source venv/bin/activate
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py check
python manage.py shell
```

## Redis
```bash
redis-server
```

## Celery
```bash
celery -A config worker --loglevel=info
celery -A config beat --loglevel=info
```

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Git — Current Milestone
```bash
git status
git add .
git commit -m "feat: complete booking payment refund and frontend flow"
git push origin feature/react-frontend

git checkout main
git pull origin main
git merge feature/react-frontend
git push origin main

git status
```

## Current milestone
**Phase 1 complete and tested.**

### Next
**Phase 2 — Django Admin / Event Management**

Recommended order:
1. Admin/Event Management
2. Payment & booking edge cases
3. QR ticket validation
4. Notifications
5. Search/filtering
6. Automated tests
7. Basic security
8. UI polish
9. Final documentation + viva

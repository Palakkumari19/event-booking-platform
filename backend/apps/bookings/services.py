from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.events.models import Event
from apps.venues.models import Seat

from .models import Booking
from .redis import SeatHoldCache


class BookingService:

    # ============================================================
    # CREATE BOOKING
    # ============================================================

    @staticmethod
    @transaction.atomic
    def create_booking(user, event_id, seat_id):

        print("========== CREATE BOOKING CALLED ==========")
        print("USER:", user.id)
        print("EVENT:", event_id)
        print("SEAT:", seat_id)

        # --------------------------------------------------------
        # Get event
        # --------------------------------------------------------

        try:
            event = (
                Event.objects
                .select_for_update()
                .select_related("venue")
                .get(
                    id=event_id,
                    status=Event.Status.PUBLISHED,
                )
            )

        except Event.DoesNotExist:
            raise ValidationError(
                "Event not found."
            )

        # --------------------------------------------------------
        # Check booking window
        # --------------------------------------------------------

        now = timezone.now()

        print("CURRENT TIME:", now)
        print("BOOKING START:", event.booking_start)
        print("BOOKING END:", event.booking_end)

        if now < event.booking_start:
            raise ValidationError(
                "Booking has not started yet."
            )

        if now > event.booking_end:
            raise ValidationError(
                "Booking window has closed."
            )

        # --------------------------------------------------------
        # Get seat
        # --------------------------------------------------------

        try:
            seat = (
                Seat.objects
                .select_related("section")
                .get(
                    id=seat_id,
                    is_active=True,
                )
            )

        except Seat.DoesNotExist:
            raise ValidationError(
                "Seat not found."
            )

        # --------------------------------------------------------
        # Verify seat belongs to event venue
        # --------------------------------------------------------

        if seat.section.venue_id != event.venue_id:
            raise ValidationError(
                "Selected seat does not belong to this event."
            )

        # --------------------------------------------------------
        # Verify Redis hold
        # --------------------------------------------------------

        holder = SeatHoldCache.holder(
            event.id,
            seat.id,
        )

        print("REDIS HOLDER:", holder)
        print("CURRENT USER:", user.id)

        if holder is None:
            raise ValidationError(
                "Seat hold has expired. Please select the seat again."
            )

        if int(holder) != int(user.id):
            raise ValidationError(
                "Seat is currently held by another user."
            )

        # --------------------------------------------------------
        # Check existing booking
        # --------------------------------------------------------

        if Booking.objects.filter(
            event=event,
            seat=seat,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        ).exists():

            SeatHoldCache.release_seat(
                event.id,
                seat.id,
            )

            raise ValidationError(
                "Seat is already booked."
            )

        # --------------------------------------------------------
        # Create booking
        # --------------------------------------------------------

        try:

            booking = Booking.objects.create(
                user=user,
                event=event,
                seat=seat,
                status=Booking.Status.PENDING,
            )

        except IntegrityError:

            raise ValidationError(
                "Seat has just been booked by another user."
            )

        # --------------------------------------------------------
        # Release Redis hold
        # --------------------------------------------------------

        SeatHoldCache.release_seat(
            event.id,
            seat.id,
        )

        print(
            "BOOKING CREATED:",
            booking.id,
        )

        return booking

    # ============================================================
    # CANCEL BOOKING
    # ============================================================

    @staticmethod
    @transaction.atomic
    def cancel_booking(user, booking_id):

        try:
            booking = (
                Booking.objects
                .select_for_update()
                .select_related(
                    "event",
                    "seat",
                    "user",
                )
                .get(
                    id=booking_id,
                )
            )

        except Booking.DoesNotExist:
            raise ValidationError(
                "Booking not found."
            )

        if booking.user != user:
            raise PermissionDenied(
                "You cannot cancel another user's booking."
            )

        if booking.status == Booking.Status.CANCELLED:
            raise ValidationError(
                "Booking is already cancelled."
            )

        booking.status = Booking.Status.CANCELLED

        booking.save(
            update_fields=["status"]
        )

        SeatHoldCache.release_seat(
            booking.event.id,
            booking.seat.id,
        )

        return booking

    # ============================================================
    # CONFIRM BOOKING
    # ============================================================

    @staticmethod
    @transaction.atomic
    def confirm_booking(booking):

        if booking.status == Booking.Status.CONFIRMED:
            return booking

        if booking.status == Booking.Status.CANCELLED:
            raise ValidationError(
                "Cancelled bookings cannot be confirmed."
            )

        booking.status = Booking.Status.CONFIRMED

        booking.save(
            update_fields=["status"]
        )

        return booking

    # ============================================================
    # HOLD SEAT
    # ============================================================

    @staticmethod
    def hold_seat(user, event_id, seat_id):

        # --------------------------------------------------------
        # Get event
        # --------------------------------------------------------

        try:
            event = Event.objects.get(
                id=event_id,
                status=Event.Status.PUBLISHED,
            )

        except Event.DoesNotExist:
            raise ValidationError(
                "Event not found."
            )

        # --------------------------------------------------------
        # Check booking window
        # --------------------------------------------------------

        now = timezone.now()

        if now < event.booking_start:
            raise ValidationError(
                "Booking has not started yet."
            )

        if now > event.booking_end:
            raise ValidationError(
                "Booking window has closed."
            )

        # --------------------------------------------------------
        # Get seat
        # --------------------------------------------------------

        try:
            seat = (
                Seat.objects
                .select_related("section")
                .get(
                    id=seat_id,
                    is_active=True,
                )
            )

        except Seat.DoesNotExist:
            raise ValidationError(
                "Seat not found."
            )

        # --------------------------------------------------------
        # Verify venue
        # --------------------------------------------------------

        if seat.section.venue_id != event.venue_id:
            raise ValidationError(
                "Seat does not belong to this event."
            )

        # --------------------------------------------------------
        # Check existing booking
        # --------------------------------------------------------

        if Booking.objects.filter(
            event=event,
            seat=seat,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        ).exists():

            raise ValidationError(
                "Seat is already booked."
            )

        # --------------------------------------------------------
        # Check existing Redis hold
        # --------------------------------------------------------

        existing_holder = SeatHoldCache.holder(
            event.id,
            seat.id,
        )

        if existing_holder is not None:

            if int(existing_holder) == int(user.id):
                return {
                    "message": "Seat is already held by you.",
                    "expires_in": SeatHoldCache.ttl(
                        event.id,
                        seat.id,
                    ),
                }

            raise ValidationError(
                "Seat is currently held by another user."
            )

        # --------------------------------------------------------
        # Maximum 4 active holds per user
        # --------------------------------------------------------

        if SeatHoldCache.held_by_user(user.id) >= 4:
            raise ValidationError(
                "Maximum of 4 seats can be held simultaneously."
            )

        # --------------------------------------------------------
        # Create Redis hold
        # --------------------------------------------------------

        SeatHoldCache.hold_seat(
            event.id,
            seat.id,
            user.id,
        )

        return {
            "message": "Seat held successfully.",
            "expires_in": settings.REDIS_SEAT_HOLD_TIMEOUT,
        }

    # ============================================================
    # HOLD STATUS
    # ============================================================

    @staticmethod
    def hold_status(event_id, seat_id):

        holder = SeatHoldCache.holder(
            event_id,
            seat_id,
        )

        if holder is None:
            return {
                "held": False,
                "user": None,
                "expires_in": 0,
            }

        return {
            "held": True,
            "user": holder,
            "expires_in": SeatHoldCache.ttl(
                event_id,
                seat_id,
            ),
        }
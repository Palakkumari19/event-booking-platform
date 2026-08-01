from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.conf import settings
from .redis import SeatHoldCache
from rest_framework.exceptions import PermissionDenied, ValidationError

from apps.events.models import Event
from apps.venues.models import Seat

from .models import Booking


class BookingService:

    @staticmethod
    @transaction.atomic
    def create_booking(user, event_id, seat_id):

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
            raise ValidationError("Event not found.")

        now = timezone.now()

        if now < event.booking_start:
            raise ValidationError("Booking has not started yet.")

        if now > event.booking_end:
            raise ValidationError("Booking window has closed.")

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
            raise ValidationError("Seat not found.")

        if seat.section.venue_id != event.venue_id:
            raise ValidationError(
                "Selected seat does not belong to this event."
            )

        if Booking.objects.filter(
            event=event,
            seat=seat,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        ).exists():
            raise ValidationError(
                f"Seat {seat.row}{seat.seat_number} has already been booked."
            )

        try:
            booking = Booking.objects.create(
                user=user,
                event=event,
                seat=seat,
            )

        except DjangoValidationError:
            raise ValidationError(
                f"Seat {seat.row}{seat.seat_number} has already been booked."
            )

        except IntegrityError:
            raise ValidationError(
                "Seat has just been booked by another user."
            )

        return booking

    @staticmethod
    @transaction.atomic
    def cancel_booking(user, booking_id):

        try:
            booking = Booking.objects.select_related(
                "user"
            ).get(id=booking_id)

        except Booking.DoesNotExist:
            raise ValidationError("Booking not found.")

        if booking.user != user:
            raise PermissionDenied(
                "You cannot cancel someone else's booking."
            )

        if booking.status == Booking.Status.CANCELLED:
            raise ValidationError(
                "Booking is already cancelled."
            )

        booking.status = Booking.Status.CANCELLED
        booking.save(update_fields=["status"])

        return booking


    @staticmethod
    def hold_seat(user, event_id, seat_id):

        try:
            event = Event.objects.get(
                id=event_id,
                status=Event.Status.PUBLISHED,
            )
        except Event.DoesNotExist:
            raise ValidationError("Event not found.")

        try:
            seat = Seat.objects.select_related("section").get(
                id=seat_id,
                is_active=True,
            )
        except Seat.DoesNotExist:
            raise ValidationError("Seat not found.")

        if seat.section.venue_id != event.venue_id:
            raise ValidationError(
                "Seat does not belong to this event."
            )

        if Booking.objects.filter(
            event=event,
            seat=seat,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        ).exists():
            raise ValidationError(
                "Seat already booked."
            )

        if SeatHoldCache.is_held(event.id, seat.id):
            raise ValidationError(
                "Seat is currently held."
            )

        SeatHoldCache.hold_seat(
            event.id,
            seat.id,
            user.id,
        )

        return {
            "message": "Seat held successfully.",
            "expires_in": settings.REDIS_SEAT_HOLD_TIMEOUT,
        }


    @staticmethod
    def hold_status(event_id, seat_id):

        held = SeatHoldCache.is_held(
            event_id,
            seat_id,
        )

        ttl = SeatHoldCache.ttl(
            event_id,
            seat_id,
        )

        return {
            "held": held,
            "remaining_seconds": ttl,
        }
from django.db import transaction
from django.utils import timezone

from rest_framework.exceptions import ValidationError

from apps.events.models import Event
from apps.venues.models import Seat

from .models import Booking


class BookingService:

    @staticmethod
    @transaction.atomic
    def create_booking(user, event_id, seat_id):

        try:
            event = Event.objects.select_related("venue").get(
                id=event_id,
                status=Event.Status.PUBLISHED,
            )
        except Event.DoesNotExist:
            raise ValidationError("Event not found.")

        now = timezone.now()

        if now < event.booking_start:
            raise ValidationError("Booking has not started yet.")

        if now > event.booking_end:
            raise ValidationError("Booking window has closed.")

        try:
            seat = Seat.objects.select_related("section").get(
                id=seat_id,
                is_active=True,
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

        booking = Booking.objects.create(
            user=user,
            event=event,
            seat=seat,
        )

        return booking
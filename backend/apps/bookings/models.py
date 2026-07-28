from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.accounts.models import User
from apps.events.models import Event
from apps.venues.models import Seat


class Booking(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CANCELLED = "CANCELLED", "Cancelled"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    seat = models.ForeignKey(
        Seat,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    booked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-booked_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["event", "seat"],
                name="unique_seat_booking_per_event",
            )
        ]

    def clean(self):
        if self.seat.section.venue_id != self.event.venue_id:
            raise ValidationError(
                "Selected seat does not belong to the event venue."
            )

        if not self.seat.is_active:
            raise ValidationError(
                {"seat": "This seat is inactive."}
            )

        if self.event.status != Event.Status.PUBLISHED:
            raise ValidationError(
                "Bookings are only allowed for published events."
            )

        now = timezone.now()

        if now < self.event.booking_start:
            raise ValidationError(
                "Booking has not opened yet."
            )

        if now > self.event.booking_end:
            raise ValidationError(
                "Booking has already closed."
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.user.email} | "
            f"{self.event.title} | "
            f"{self.seat}"
        )
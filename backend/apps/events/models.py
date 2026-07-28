from django.core.exceptions import ValidationError
from django.db import models

from apps.accounts.models import User
from apps.venues.models import Venue


class Event(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    organizer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="events",
    )

    venue = models.ForeignKey(
        Venue,
        on_delete=models.PROTECT,
        related_name="events",
    )

    title = models.CharField(max_length=255)

    description = models.TextField(blank=True)

    start_time = models.DateTimeField()

    end_time = models.DateTimeField()

    booking_start = models.DateTimeField()

    booking_end = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def clean(self):
        if self.end_time <= self.start_time:
            raise ValidationError(
                {"end_time": "End time must be after start time."}
            )

        if self.booking_end <= self.booking_start:
            raise ValidationError(
                {"booking_end": "Booking end must be after booking start."}
            )

        if self.booking_end > self.start_time:
            raise ValidationError(
                {
                    "booking_end": "Bookings must close before the event starts."
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
from django.db import models

from apps.bookings.models import Booking


class Ticket(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        USED = "USED", "Used"
        CANCELLED = "CANCELLED", "Cancelled"

    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="ticket",
    )

    ticket_number = models.CharField(
        max_length=30,
        unique=True,
    )

    qr_code = models.ImageField(
        upload_to="tickets/qr_codes/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    issued_at = models.DateTimeField(
        auto_now_add=True,
    )

    checked_in_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-issued_at"]

    def __str__(self):
        return self.ticket_number
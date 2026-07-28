import uuid

from django.db import models

from apps.bookings.models import Booking


class Ticket(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="ticket",
    )

    ticket_number = models.CharField(
        max_length=36,
        unique=True,
        editable=False,
    )

    qr_code = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    issued_at = models.DateTimeField(auto_now_add=True)

    is_checked_in = models.BooleanField(default=False)

    checked_in_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-issued_at"]

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = str(uuid.uuid4())

        super().save(*args, **kwargs)

    def __str__(self):
        return self.ticket_number
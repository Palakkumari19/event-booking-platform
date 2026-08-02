from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.bookings.models import Booking

from .models import Ticket
from .services import TicketService


@receiver(post_save, sender=Booking)
def create_booking_ticket(
    sender,
    instance,
    created,
    **kwargs,
):

    if not created:
        return

    if hasattr(instance, "ticket"):
        return

    TicketService.create_ticket(instance)
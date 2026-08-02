from django.db import transaction

from .models import Ticket


class TicketService:

    @staticmethod
    @transaction.atomic
    def create_ticket(booking):

        year = booking.booked_at.year

        last_ticket = (
            Ticket.objects
            .filter(
                ticket_number__startswith=f"CP-{year}"
            )
            .order_by("-id")
            .first()
        )

        if last_ticket:
            last_number = int(
                last_ticket.ticket_number.split("-")[-1]
            )
        else:
            last_number = 0

        ticket_number = (
            f"CP-{year}-{last_number + 1:06d}"
        )

        return Ticket.objects.create(
            booking=booking,
            ticket_number=ticket_number,
        )
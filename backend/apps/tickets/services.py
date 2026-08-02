from django.db import transaction

from .models import Ticket
from .utils import generate_qr


class TicketService:

    @staticmethod
    @transaction.atomic
    def create_ticket(booking):

        year = booking.booked_at.year

        last_ticket = (
            Ticket.objects.filter(
                ticket_number__startswith=f"CP-{year}"
            )
            .order_by("-id")
            .first()
        )

        if last_ticket:
            number = (
                int(
                    last_ticket.ticket_number.split("-")[-1]
                )
                + 1
            )
        else:
            number = 1

        ticket = Ticket.objects.create(
            booking=booking,
            ticket_number=f"CP-{year}-{number:06d}",
        )

        generate_qr(ticket)

        ticket.save()

        return ticket
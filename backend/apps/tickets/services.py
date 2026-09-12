from django.db import transaction
from django.utils import timezone

from rest_framework.exceptions import ValidationError

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

    @staticmethod
    @transaction.atomic
    def validate_ticket(ticket_number):

        try:
            ticket = (
                Ticket.objects
                .select_for_update()
                .select_related(
                    "booking",
                    "booking__user",
                    "booking__event",
                    "booking__event__venue",
                    "booking__seat",
                    "booking__seat__section",
                )
                .get(
                    ticket_number=ticket_number,
                )
            )

        except Ticket.DoesNotExist:
            raise ValidationError(
                "Ticket not found."
            )

        if ticket.status == Ticket.Status.USED:
            raise ValidationError(
                "This ticket has already been used."
            )

        if ticket.status == Ticket.Status.CANCELLED:
            raise ValidationError(
                "This ticket has been cancelled."
            )

        if ticket.booking.status != "CONFIRMED":
            raise ValidationError(
                "This ticket does not have a confirmed booking."
            )

        ticket.status = Ticket.Status.USED
        ticket.checked_in_at = timezone.now()

        ticket.save(
            update_fields=[
                "status",
                "checked_in_at",
            ]
        )

        return ticket
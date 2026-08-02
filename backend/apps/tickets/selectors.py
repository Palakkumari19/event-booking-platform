from .models import Ticket


def get_user_tickets(user):
    return (
        Ticket.objects.filter(
            booking__user=user
        )
        .select_related(
            "booking",
            "booking__event",
            "booking__event__venue",
            "booking__seat",
            "booking__seat__section",
        )
        .order_by("-issued_at")
    )


def get_ticket(ticket_id, user):
    return (
        Ticket.objects.select_related(
            "booking",
            "booking__event",
            "booking__event__venue",
            "booking__seat",
            "booking__seat__section",
        )
        .get(
            id=ticket_id,
            booking__user=user,
        )
    )
from apps.bookings.models import Booking
from apps.venues.models import Seat


def get_event_seats(event):
    event_sections = (
        event.event_sections
        .select_related("section")
        .order_by("section__display_order")
    )

    booked_seat_ids = set(
        Booking.objects.filter(
            event=event,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        ).values_list("seat_id", flat=True)
    )

    response = []

    for event_section in event_sections:

        seats = (
            Seat.objects.filter(
                section=event_section.section,
                is_active=True,
            )
            .order_by("row", "seat_number")
        )

        seat_list = []

        for seat in seats:
            seat_list.append(
                {
                    "id": seat.id,
                    "row": seat.row,
                    "seat_number": seat.seat_number,
                    "status": (
                        "BOOKED"
                        if seat.id in booked_seat_ids
                        else "AVAILABLE"
                    ),
                }
            )

        response.append(
            {
                "section": {
                    "id": event_section.section.id,
                    "name": event_section.section.name,
                    "price": str(event_section.price),
                },
                "seats": seat_list,
            }
        )

    return response


def get_user_bookings(user):
    return (
        Booking.objects.filter(user=user)
        .select_related(
            "event",
            "event__venue",
            "seat",
            "seat__section",
        )
        .order_by("-booked_at")
    )
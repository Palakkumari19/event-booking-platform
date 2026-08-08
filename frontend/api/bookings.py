from .client import client


def get_event_seats(event_id, token):

    response = client.get(
        f"/events/{event_id}/seats/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return None


def hold_seat(event_id, seat_id, token):

    response = client.post(
        "/bookings/hold/",
        {
            "event": event_id,
            "seat": seat_id,
        },
        token,
    )

    return response


def create_booking(
    event_id,
    seat_id,
    token,
):

    response = client.post(
        "/bookings/",
        {
            "event": event_id,
            "seat": seat_id,
        },
        token,
    )

    return response

def get_my_bookings(token):
    response = client.get(
        "/bookings/my-bookings/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return []

def cancel_booking(booking_id, token):

    return client.patch(
        f"/bookings/{booking_id}/cancel/",
        token,
    )
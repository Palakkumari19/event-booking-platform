from .client import client


def get_my_tickets(token):
    response = client.get(
        "/tickets/my-tickets/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return []


def get_ticket(ticket_id, token):
    response = client.get(
        f"/tickets/{ticket_id}/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return None
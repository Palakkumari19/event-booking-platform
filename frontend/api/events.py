from .client import client


def get_events(token):

    response = client.get(
        "/events/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return None
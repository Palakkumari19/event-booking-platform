from .client import client


def get_events(token):

    return client.get(
        "/events/",
        token,
    )
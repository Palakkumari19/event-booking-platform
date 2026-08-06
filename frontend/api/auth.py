from .client import client


def login(email, password):
    return client.post(
        "/auth/login/",
        {
            "email": email,
            "password": password,
        },
    )
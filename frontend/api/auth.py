from .client import client


def login(email, password):

    response = client.post(
        "/auth/login/",
        {
            "email": email,
            "password": password,
        },
    )

    return response


def get_profile(token):

    return client.get(
        "/auth/profile/",
        token,
    )
from .client import client


def login(email, password):
    return client.post(
        "/auth/login/",
        {
            "email": email,
            "password": password,
        },
    )

def get_current_user(token):

    response = client.get(
        "/auth/me/",
        token,
    )

    if response.status_code == 200:
        return response.json()

    return None
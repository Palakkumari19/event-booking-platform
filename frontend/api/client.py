import requests

from utils.constants import BASE_URL


class APIClient:

    def __init__(self):

        self.base_url = BASE_URL

    def get(self, endpoint, token=None):

        headers = {}

        if token:
            headers["Authorization"] = (
                f"Bearer {token}"
            )

        return requests.get(
            f"{self.base_url}{endpoint}",
            headers=headers,
        )

    def post(
        self,
        endpoint,
        data,
        token=None,
    ):

        headers = {
            "Content-Type": "application/json",
        }

        if token:
            headers["Authorization"] = (
                f"Bearer {token}"
            )

        return requests.post(
            f"{self.base_url}{endpoint}",
            json=data,
            headers=headers,
        )


    def patch(
        self,
        endpoint,
        token=None,
    ):

        headers = {}

        if token:
            headers["Authorization"] = (
                f"Bearer {token}"
            )

        return requests.patch(
            f"{self.base_url}{endpoint}",
            headers=headers,
        )


client = APIClient()
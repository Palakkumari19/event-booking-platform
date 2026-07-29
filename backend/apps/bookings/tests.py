from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User


class BookingAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="user@test.com",
            password="password123",
            first_name="Test",
            last_name="User",
        )

    def test_requires_authentication(self):
        response = self.client.get(
            "/api/bookings/my-bookings/"
        )

        self.assertEqual(response.status_code, 401)
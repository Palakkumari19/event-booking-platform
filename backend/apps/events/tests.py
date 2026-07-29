from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.events.models import Event
from apps.venues.models import Venue


class EventListAPITest(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.organizer = User.objects.create_user(
            email="organizer@test.com",
            password="password123",
            first_name="Test",
            last_name="Organizer",
            role=User.Role.ORGANIZER,
        )

        self.venue = Venue.objects.create(
            name="Test Venue",
            address="123 Street",
            city="Bengaluru",
            state="Karnataka",
            country="India",
            postal_code="560001",
        )

        Event.objects.create(
            organizer=self.organizer,
            venue=self.venue,
            title="Published Event",
            description="Visible",
            start_time="2027-01-10T10:00:00Z",
            end_time="2027-01-10T12:00:00Z",
            booking_start="2026-12-01T10:00:00Z",
            booking_end="2027-01-09T10:00:00Z",
            status=Event.Status.PUBLISHED,
        )

        Event.objects.create(
            organizer=self.organizer,
            venue=self.venue,
            title="Draft Event",
            description="Hidden",
            start_time="2027-01-11T10:00:00Z",
            end_time="2027-01-11T12:00:00Z",
            booking_start="2026-12-01T10:00:00Z",
            booking_end="2027-01-10T10:00:00Z",
            status=Event.Status.DRAFT,
        )

    def test_only_published_events_are_returned(self):
        response = self.client.get("/api/events/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Published Event")
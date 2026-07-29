from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.events.models import Event, EventSection
from apps.venues.models import Section, Venue


class EventAPITest(TestCase):
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

        self.section = Section.objects.create(
            venue=self.venue,
            name="VIP",
            display_order=1,
        )

        self.event = Event.objects.create(
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

        EventSection.objects.create(
            event=self.event,
            section=self.section,
            price=8000,
        )

    def test_event_list(self):
        response = self.client.get("/api/events/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    def test_event_detail(self):
        response = self.client.get(
            f"/api/events/{self.event.id}/"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Published Event")
        self.assertEqual(len(response.data["sections"]), 1)
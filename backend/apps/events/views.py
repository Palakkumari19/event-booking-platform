from django.db.models import Q
from django.shortcuts import get_object_or_404

from django.db.models import Count
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Event
from .serializers import (
    EventDetailSerializer,
    EventListSerializer,
    SeatStatusSerializer,
    OrganizerEventCreateSerializer,
    OrganizerEventListSerializer,
)

from apps.bookings.models import Booking
from apps.bookings.redis import SeatHoldCache
from apps.venues.models import Seat
from .permissions import IsOrganizer


class EventListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = (
            Event.objects.filter(
                status=Event.Status.PUBLISHED,
            )
            .select_related("venue")
        )

        # Search by event title or description.
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
            )

        # Filter by venue name.
        venue = self.request.query_params.get("venue")

        if venue:
            queryset = queryset.filter(
                venue__name__icontains=venue
            )

        # Show only events that haven't started yet.
        upcoming = self.request.query_params.get("upcoming")

        if upcoming and upcoming.lower() == "true":
            from django.utils import timezone

            queryset = queryset.filter(
                start_time__gte=timezone.now()
            )

        # Sorting.
        ordering = self.request.query_params.get(
            "ordering",
            "start_time",
        )

        allowed_orderings = {
            "start_time",
            "-start_time",
            "title",
            "-title",
        }

        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("start_time")

        return queryset


class EventDetailView(generics.RetrieveAPIView):
    serializer_class = EventDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Event.objects.filter(
                status=Event.Status.PUBLISHED,
            )
            .select_related("venue")
            .prefetch_related(
                "event_sections",
                "event_sections__section",
            )
        )


class EventSeatListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, event_id):

        event = get_object_or_404(
            Event,
            id=event_id,
            status=Event.Status.PUBLISHED,
        )

        seats = (
            Seat.objects.filter(
                section__venue=event.venue,
                is_active=True,
            )
            .select_related("section")
            .order_by(
                "section__display_order",
                "row",
                "seat_number",
            )
        )

        statuses = {}

        booked = Booking.objects.filter(
            event=event,
            status__in=[
                Booking.Status.PENDING,
                Booking.Status.CONFIRMED,
            ],
        )

        for booking in booked:
            statuses[booking.seat_id] = "BOOKED"

        for seat in seats:

            if (
                seat.id not in statuses
                and SeatHoldCache.is_held(
                    event.id,
                    seat.id,
                )
            ):
                statuses[seat.id] = "HELD"

        serializer = SeatStatusSerializer(
            seats,
            many=True,
            context={
                "statuses": statuses,
            },
        )

        return Response(serializer.data)

class OrganizerEventListView(generics.ListAPIView):
    serializer_class = OrganizerEventListSerializer
    permission_classes = [
        IsAuthenticated,
        IsOrganizer,
    ]

    def get_queryset(self):
        return (
            Event.objects.filter(
                organizer=self.request.user,
            )
            .select_related("venue")
            .annotate(
                booking_count=Count(
                    "bookings",
                    distinct=True,
                )
            )
            .order_by("-created_at")
        )


class OrganizerEventCreateView(generics.CreateAPIView):
    serializer_class = OrganizerEventCreateSerializer
    permission_classes = [
        IsAuthenticated,
        IsOrganizer,
    ]


class OrganizerEventDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrganizerEventCreateSerializer
    permission_classes = [
        IsAuthenticated,
        IsOrganizer,
    ]

    def get_queryset(self):
        return Event.objects.filter(
            organizer=self.request.user,
        )


class OrganizerPublishEventView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOrganizer,
    ]

    def patch(self, request, event_id):
        event = get_object_or_404(
            Event,
            id=event_id,
            organizer=request.user,
        )

        if event.status != Event.Status.DRAFT:
            return Response(
                {
                    "detail": (
                        "Only draft events can be published."
                    )
                },
                status=400,
            )

        event.status = Event.Status.PUBLISHED
        event.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "Event published successfully.",
                "event_id": event.id,
                "status": event.status,
            }
        )


class OrganizerCancelEventView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsOrganizer,
    ]

    def patch(self, request, event_id):
        event = get_object_or_404(
            Event,
            id=event_id,
            organizer=request.user,
        )

        if event.status == Event.Status.CANCELLED:
            return Response(
                {
                    "detail": "Event is already cancelled."
                },
                status=400,
            )

        if event.status == Event.Status.COMPLETED:
            return Response(
                {
                    "detail": (
                        "Completed events cannot be cancelled."
                    )
                },
                status=400,
            )

        event.status = Event.Status.CANCELLED
        event.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Event cancelled successfully.",
                "event_id": event.id,
                "status": event.status,
            }
        )
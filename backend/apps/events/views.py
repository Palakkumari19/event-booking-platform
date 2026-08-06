from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Event
from .serializers import (
    EventDetailSerializer,
    EventListSerializer,
)

from apps.bookings.models import Booking
from apps.bookings.redis import SeatHoldCache
from apps.venues.models import Seat

from .serializers import SeatStatusSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404


class EventListView(generics.ListAPIView):
    serializer_class = EventListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Event.objects.filter(
                status=Event.Status.PUBLISHED,
            )
            .select_related("venue")
            .order_by("start_time")
        )


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
            statuses[
                booking.seat_id
            ] = "BOOKED"

        for seat in seats:

            if (
                seat.id not in statuses
                and SeatHoldCache.is_held(
                    event.id,
                    seat.id,
                )
            ):
                statuses[
                    seat.id
                ] = "HELD"

        serializer = SeatStatusSerializer(
            seats,
            many=True,
            context={
                "statuses": statuses,
            },
        )

        return Response(serializer.data)
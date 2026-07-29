from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event

from .selectors import (
    get_event_seats,
    get_user_bookings,
)
from .serializers import (
    BookingCreateSerializer,
    BookingResponseSerializer,
    MyBookingSerializer,
)
from .services import BookingService


class SeatAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        event_id = request.query_params.get("event")

        if not event_id:
            return Response(
                {"detail": "event query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = get_object_or_404(
            Event.objects.filter(status=Event.Status.PUBLISHED),
            pk=event_id,
        )

        return Response(get_event_seats(event))


class BookingCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = BookingService.create_booking(
            user=request.user,
            event_id=serializer.validated_data["event"],
            seat_id=serializer.validated_data["seat"],
        )

        return Response(
            BookingResponseSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class MyBookingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = get_user_bookings(request.user)

        serializer = MyBookingSerializer(
            bookings,
            many=True,
        )

        return Response(serializer.data)
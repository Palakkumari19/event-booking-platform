from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.events.models import Event

from .selectors import get_event_seats


class SeatAvailabilityView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        event_id = request.query_params.get("event")

        if not event_id:
            return Response(
                {
                    "detail": "event query parameter is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = get_object_or_404(
            Event.objects.filter(
                status=Event.Status.PUBLISHED,
            ),
            pk=event_id,
        )

        data = get_event_seats(event)

        return Response(data)
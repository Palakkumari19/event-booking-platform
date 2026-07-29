from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Event
from .serializers import EventListSerializer


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
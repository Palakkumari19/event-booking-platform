from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Venue, Section
from .serializers import (
    VenueListSerializer,
    SectionListSerializer,
)


class VenueListView(generics.ListAPIView):
    queryset = Venue.objects.all()
    serializer_class = VenueListSerializer
    permission_classes = [AllowAny]


class VenueSectionListView(generics.ListAPIView):
    serializer_class = SectionListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Section.objects.filter(
            venue_id=self.kwargs["venue_id"]
        ).order_by("display_order")
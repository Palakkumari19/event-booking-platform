from rest_framework import serializers

from .models import Venue, Section


class VenueListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = (
            "id",
            "name",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "description",
        )


class SectionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = (
            "id",
            "name",
            "display_order",
        )
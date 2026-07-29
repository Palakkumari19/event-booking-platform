from rest_framework import serializers

from .models import Event, EventSection


class EventListSerializer(serializers.ModelSerializer):
    venue = serializers.CharField(source="venue.name", read_only=True)

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "description",
            "venue",
            "start_time",
            "end_time",
        )


class VenueSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    city = serializers.CharField()


class EventSectionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="section.id")
    name = serializers.CharField(source="section.name")

    class Meta:
        model = EventSection
        fields = (
            "id",
            "name",
            "price",
        )


class EventDetailSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)

    sections = EventSectionSerializer(
        source="event_sections",
        many=True,
        read_only=True,
    )

    class Meta:
        model = Event
        fields = (
            "id",
            "title",
            "description",
            "venue",
            "start_time",
            "end_time",
            "booking_start",
            "booking_end",
            "sections",
        )
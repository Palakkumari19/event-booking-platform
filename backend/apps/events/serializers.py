from rest_framework import serializers

from .models import Event, EventSection
from apps.venues.models import Seat


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

class SeatStatusSerializer(serializers.ModelSerializer):

    section = serializers.CharField(
        source="section.name",
    )

    status = serializers.SerializerMethodField()

    class Meta:
        model = Seat

        fields = (
            "id",
            "section",
            "row",
            "seat_number",
            "status",
        )

    def get_status(self, obj):

        statuses = self.context["statuses"]

        return statuses.get(
            obj.id,
            "AVAILABLE",
        )

class OrganizerEventSectionSerializer(serializers.Serializer):
    section = serializers.IntegerField()
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
    )


class OrganizerEventCreateSerializer(serializers.ModelSerializer):
    sections = OrganizerEventSectionSerializer(
        many=True,
        write_only=True,
    )

    class Meta:
        model = Event

        fields = (
            "title",
            "description",
            "venue",
            "start_time",
            "end_time",
            "booking_start",
            "booking_end",
            "sections",
        )

    def validate(self, attrs):
        sections = attrs.get("sections", [])

        if not sections:
            raise serializers.ValidationError(
                {
                    "sections": (
                        "At least one ticket section is required."
                    )
                }
            )

        section_ids = [item["section"] for item in sections]

        if len(section_ids) != len(set(section_ids)):
            raise serializers.ValidationError(
                {
                    "sections": (
                        "A section cannot be added more than once."
                    )
                }
            )

        venue = attrs["venue"]

        venue_section_ids = set(
            venue.sections.values_list(
                "id",
                flat=True,
            )
        )

        invalid_sections = [
            section_id
            for section_id in section_ids
            if section_id not in venue_section_ids
        ]

        if invalid_sections:
            raise serializers.ValidationError(
                {
                    "sections": (
                        "One or more selected sections "
                        "do not belong to this venue."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        sections_data = validated_data.pop("sections")

        organizer = self.context["request"].user

        event = Event.objects.create(
            organizer=organizer,
            status=Event.Status.DRAFT,
            **validated_data,
        )

        EventSection.objects.bulk_create(
            [
                EventSection(
                    event=event,
                    section_id=section_data["section"],
                    price=section_data["price"],
                )
                for section_data in sections_data
            ]
        )

        return event


class OrganizerEventListSerializer(serializers.ModelSerializer):
    venue = serializers.CharField(
        source="venue.name",
        read_only=True,
    )

    booking_count = serializers.IntegerField(
        read_only=True,
    )

    class Meta:
        model = Event

        fields = (
            "id",
            "title",
            "venue",
            "start_time",
            "end_time",
            "booking_start",
            "booking_end",
            "status",
            "booking_count",
        )
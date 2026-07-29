from rest_framework import serializers

from .models import Event


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
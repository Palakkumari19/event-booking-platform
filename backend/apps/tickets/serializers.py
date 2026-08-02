from rest_framework import serializers

from .models import Ticket


class TicketListSerializer(serializers.ModelSerializer):
    event = serializers.CharField(source="booking.event.title")
    venue = serializers.CharField(source="booking.event.venue.name")
    seat = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_number",
            "event",
            "venue",
            "seat",
            "status",
            "issued_at",
        )

    def get_seat(self, obj):
        return (
            f"{obj.booking.seat.row}"
            f"{obj.booking.seat.seat_number}"
        )


class TicketDetailSerializer(serializers.ModelSerializer):
    event = serializers.SerializerMethodField()
    seat = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = (
            "id",
            "ticket_number",
            "event",
            "seat",
            "status",
            "issued_at",
            "qr_code",
        )

    def get_event(self, obj):
        return {
            "title": obj.booking.event.title,
            "venue": obj.booking.event.venue.name,
            "start_time": obj.booking.event.start_time,
        }

    def get_seat(self, obj):
        return {
            "section": obj.booking.seat.section.name,
            "row": obj.booking.seat.row,
            "seat_number": obj.booking.seat.seat_number,
        }

    def get_qr_code(self, obj):
        request = self.context.get("request")

        if not obj.qr_code:
            return None

        return request.build_absolute_uri(
            obj.qr_code.url
        )
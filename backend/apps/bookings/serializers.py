from rest_framework import serializers

from .models import Booking


class SeatSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    row = serializers.CharField()
    seat_number = serializers.IntegerField()
    status = serializers.CharField()


class SectionSeatSerializer(serializers.Serializer):
    section = serializers.DictField()
    seats = SeatSerializer(many=True)


class BookingCreateSerializer(serializers.Serializer):
    event = serializers.IntegerField()
    seat = serializers.IntegerField()


class SeatHoldSerializer(serializers.Serializer):
    event = serializers.IntegerField()
    seat = serializers.IntegerField()


class BookingResponseSerializer(serializers.ModelSerializer):
    event = serializers.CharField(source="event.title")
    seat = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "status",
            "event",
            "seat",
        )

    def get_seat(self, obj):
        return {
            "row": obj.seat.row,
            "seat_number": obj.seat.seat_number,
        }


class MyBookingSerializer(serializers.ModelSerializer):
    event = serializers.SerializerMethodField()
    venue = serializers.CharField(source="event.venue.name")
    seat = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "status",
            "event",
            "venue",
            "seat",
            "price",
            "booked_at",
        )

    def get_event(self, obj):
        return {
            "id": obj.event.id,
            "title": obj.event.title,
        }

    def get_seat(self, obj):
        return f"{obj.seat.row}{obj.seat.seat_number}"

    def get_price(self, obj):
        event_section = obj.event.event_sections.get(
            section=obj.seat.section
        )
        return str(event_section.price)
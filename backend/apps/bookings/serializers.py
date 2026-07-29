from rest_framework import serializers


class SeatSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    row = serializers.CharField()
    seat_number = serializers.IntegerField()
    status = serializers.CharField()


class SectionSeatSerializer(serializers.Serializer):
    section = serializers.DictField()
    seats = SeatSerializer(many=True)
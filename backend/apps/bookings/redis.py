from django.conf import settings
from django.core.cache import cache


class SeatHoldCache:

    PREFIX = "seat_hold"

    @classmethod
    def key(cls, event_id, seat_id):
        return f"{cls.PREFIX}:{event_id}:{seat_id}"

    @classmethod
    def hold_seat(cls, event_id, seat_id, user_id):
        cache.set(
            cls.key(event_id, seat_id),
            user_id,
            timeout=settings.REDIS_SEAT_HOLD_TIMEOUT,
        )

    @classmethod
    def release_seat(cls, event_id, seat_id):
        cache.delete(cls.key(event_id, seat_id))

    @classmethod
    def holder(cls, event_id, seat_id):
        return cache.get(cls.key(event_id, seat_id))

    @classmethod
    def is_held(cls, event_id, seat_id):
        return cls.holder(event_id, seat_id) is not None
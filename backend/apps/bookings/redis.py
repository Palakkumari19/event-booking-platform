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

    @classmethod
    def ttl(cls, event_id, seat_id):

        client = cache.client.get_client(write=False)

        key = f":1:{cls.key(event_id, seat_id)}"

        ttl = client.ttl(key)

        if ttl < 0:
            return 0

        return ttl

    @classmethod
    def all_held_seats(cls, event_id):

        client = cache.client.get_client(write=False)

        held = set()

        pattern = f"*{cls.PREFIX}:{event_id}:*"

        for key in client.scan_iter(match=pattern):

            seat_id = int(
                key.decode().split(":")[-1]
            )

            held.add(seat_id)

        return held
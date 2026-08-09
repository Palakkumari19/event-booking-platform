from django.conf import settings
from django.core.cache import cache


class SeatHoldCache:

    PREFIX = "seat_hold"

    # ============================================================
    # KEY
    # ============================================================

    @classmethod
    def key(cls, event_id, seat_id):

        return (
            f"{cls.PREFIX}:"
            f"{event_id}:"
            f"{seat_id}"
        )

    # ============================================================
    # HOLD
    # ============================================================

    @classmethod
    def hold_seat(
        cls,
        event_id,
        seat_id,
        user_id,
    ):

        cache.set(
            cls.key(
                event_id,
                seat_id,
            ),
            user_id,
            timeout=settings.REDIS_SEAT_HOLD_TIMEOUT,
        )

    # ============================================================
    # RELEASE
    # ============================================================

    @classmethod
    def release_seat(
        cls,
        event_id,
        seat_id,
    ):

        cache.delete(
            cls.key(
                event_id,
                seat_id,
            )
        )

    # ============================================================
    # HOLDER
    # ============================================================

    @classmethod
    def holder(
        cls,
        event_id,
        seat_id,
    ):

        return cache.get(
            cls.key(
                event_id,
                seat_id,
            )
        )

    # ============================================================
    # IS HELD
    # ============================================================

    @classmethod
    def is_held(
        cls,
        event_id,
        seat_id,
    ):

        return (
            cls.holder(
                event_id,
                seat_id,
            )
            is not None
        )

    # ============================================================
    # TTL
    # ============================================================

    @classmethod
    def ttl(
        cls,
        event_id,
        seat_id,
    ):

        client = cache.client.get_client(
            write=False
        )

        key = (
            f":1:"
            f"{cls.key(event_id, seat_id)}"
        )

        ttl = client.ttl(key)

        return max(
            ttl,
            0,
        )

    # ============================================================
    # ALL HELD SEATS
    # ============================================================

    @classmethod
    def all_held_seats(
        cls,
        event_id,
    ):

        client = cache.client.get_client(
            write=False
        )

        held = set()

        pattern = (
            f"*{cls.PREFIX}:"
            f"{event_id}:*"
        )

        for key in client.scan_iter(
            match=pattern
        ):

            key = (
                key.decode()
                if isinstance(key, bytes)
                else key
            )

            held.add(
                int(
                    key.split(":")[-1]
                )
            )

        return held

    # ============================================================
    # HOLDS BY USER
    # ============================================================

    @classmethod
    def held_by_user(
        cls,
        user_id,
    ):

        client = cache.client.get_client(
            write=False
        )

        count = 0

        pattern = (
            f"*{cls.PREFIX}:*"
        )

        for key in client.scan_iter(
            match=pattern
        ):

            value = client.get(key)

            if value is None:
                continue

            if isinstance(value, bytes):
                value = value.decode()

            try:
                if int(value) == int(user_id):
                    count += 1

            except (ValueError, TypeError):
                continue

        return count
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

from .models import Booking
from .services import BookingService


@shared_task
def cleanup_cancelled_bookings():
    """
    Cancel unpaid PENDING bookings that have exceeded the configured
    reservation timeout.
    """

    cutoff_time = timezone.now() - timedelta(
        seconds=settings.PENDING_BOOKING_TIMEOUT
    )

    stale_bookings = Booking.objects.filter(
        status=Booking.Status.PENDING,
        booked_at__lt=cutoff_time,
    ).select_related("user")

    cancelled_count = 0

    for booking in stale_bookings:
        try:
            BookingService.cancel_booking(
                user=booking.user,
                booking_id=booking.id,
            )
            cancelled_count += 1

        except Booking.DoesNotExist:
            # Booking may have been removed between the query and cancellation.
            continue

        except Exception:
            # Do not allow one problematic booking to stop cleanup
            # for all other stale bookings.
            continue

    return {
        "checked_before": cutoff_time.isoformat(),
        "cancelled_bookings": cancelled_count,
    }
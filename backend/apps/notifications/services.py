from .models import Notification


class NotificationService:

    @staticmethod
    def create_notification(user, title, message):
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
        )

    @staticmethod
    def booking_confirmed(booking):
        return NotificationService.create_notification(
            user=booking.user,
            title="Booking Confirmed",
            message=(
                f"Your booking for {booking.event.title} is confirmed. "
                f"Seat: {booking.seat.row}{booking.seat.seat_number}."
            ),
        )

    @staticmethod
    def booking_cancelled(booking):
        return NotificationService.create_notification(
            user=booking.user,
            title="Booking Cancelled",
            message=(
                f"Your booking for {booking.event.title} has been cancelled."
            ),
        )

    @staticmethod
    def payment_successful(payment):
        return NotificationService.create_notification(
            user=payment.booking.user,
            title="Payment Successful",
            message=(
                f"Payment of ₹{payment.amount} was successfully received "
                f"for {payment.booking.event.title}."
            ),
        )
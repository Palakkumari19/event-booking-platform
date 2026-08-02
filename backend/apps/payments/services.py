import razorpay

from decimal import Decimal

from django.conf import settings
from django.db import transaction

from rest_framework.exceptions import ValidationError

from apps.bookings.models import Booking
from apps.bookings.services import BookingService
from apps.events.models import EventSection

from .models import Payment
from .selectors import get_payment_by_booking


client = razorpay.Client(
    auth=(
        settings.RAZORPAY_KEY_ID,
        settings.RAZORPAY_KEY_SECRET,
    )
)


class PaymentService:

    @staticmethod
    @transaction.atomic
    def create_order(user, booking_id):

        try:
            booking = (
                Booking.objects
                .select_related(
                    "event",
                    "seat",
                    "seat__section",
                )
                .get(
                    id=booking_id,
                    user=user,
                )
            )

        except Booking.DoesNotExist:
            raise ValidationError(
                "Booking not found."
            )

        existing = get_payment_by_booking(
            booking
        )

        if existing:
            raise ValidationError(
                "Payment already exists."
            )

        event_section = EventSection.objects.get(
            event=booking.event,
            section=booking.seat.section,
        )

        amount = event_section.price

        razorpay_order = client.order.create(
            {
                "amount": int(
                    Decimal(amount) * 100
                ),
                "currency": "INR",
            }
        )

        payment = Payment.objects.create(
            booking=booking,
            razorpay_order_id=razorpay_order["id"],
            amount=amount,
        )

        return {
            "payment": payment,
            "order": razorpay_order,
        }

    @staticmethod
    @transaction.atomic
    def verify_payment(data):

        try:
            payment = Payment.objects.select_related(
                "booking"
            ).get(
                razorpay_order_id=data["razorpay_order_id"]
            )

        except Payment.DoesNotExist:
            raise ValidationError(
                "Payment not found."
            )

        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": data["razorpay_order_id"],
                "razorpay_payment_id": data["razorpay_payment_id"],
                "razorpay_signature": data["razorpay_signature"],
            }
        )

        payment.razorpay_payment_id = data["razorpay_payment_id"]

        payment.razorpay_signature = data["razorpay_signature"]

        payment.status = Payment.Status.SUCCESS

        payment.save(
            update_fields=[
                "razorpay_payment_id",
                "razorpay_signature",
                "status",
            ]
        )

        BookingService.confirm_booking(
            payment.booking
        )

        return payment
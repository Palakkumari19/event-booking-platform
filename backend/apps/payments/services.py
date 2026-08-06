import razorpay

from decimal import Decimal

from django.conf import settings
from django.db import transaction

from rest_framework.exceptions import ValidationError

from apps.bookings.models import Booking
from apps.bookings.services import BookingService
from apps.events.models import EventSection
from apps.tickets.services import TicketService

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
    def create_payment_link(user, booking_id):

        try:
            booking = (
                Booking.objects
                .select_related(
                    "event",
                    "seat",
                    "seat__section",
                    "user",
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

        payment_link = client.payment_link.create(
            {
                "amount": int(
                    Decimal(amount) * 100
                ),
                "currency": "INR",
                "accept_partial": False,
                "description": (
                    f"{booking.event.title} - "
                    f"{booking.seat.row}{booking.seat.seat_number}"
                ),
                "reference_id": f"BOOKING-{booking.id}",
                "customer": {
                    "name": booking.user.get_full_name()
                    or booking.user.username,
                    "email": booking.user.email,
                },
                "notify": {
                    "sms": False,
                    "email": False,
                },
            }
        )

        payment = Payment.objects.create(
            booking=booking,
            razorpay_order_id=payment_link["id"],
            amount=amount,
        )

        return {
            "payment": payment,
            "payment_link": payment_link,
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

        booking = BookingService.confirm_booking(
            payment.booking
        )

        if not hasattr(booking, "ticket"):
            TicketService.create_ticket(
                booking
            )

        return payment
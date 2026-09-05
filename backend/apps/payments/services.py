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

        if booking.status != Booking.Status.PENDING:
            raise ValidationError(
                "Payment can only be created for a pending booking."
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
                    or booking.user.email,
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
    def check_payment_status(user, booking_id):

        try:
            booking = (
                Booking.objects
                .select_related(
                    "event",
                    "seat",
                )
                .select_for_update()
                .get(
                    id=booking_id,
                    user=user,
                )
            )

        except Booking.DoesNotExist:
            raise ValidationError(
                "Booking not found."
            )

        payment = get_payment_by_booking(
            booking
        )

        if payment is None:
            raise ValidationError(
                "Payment not found."
            )

        payment_link = client.payment_link.fetch(
            payment.razorpay_order_id
        )

        if payment_link["status"] != "paid":

            return {
                "paid": False,
            }

        # Razorpay Payment Links expose the actual payment
        # details after a successful captured payment.
        payments = payment_link.get("payments") or []

        if not payments:
            raise ValidationError(
                "Payment was marked as paid, but Razorpay payment details are unavailable."
            )

        razorpay_payment_id = payments[0].get(
            "payment_id"
        )

        if not razorpay_payment_id:
            raise ValidationError(
                "Payment was marked as paid, but the Razorpay payment ID was not returned."
            )

        # Store the actual Razorpay payment ID.
        # This is required later if the payment needs to be refunded.
        payment.razorpay_payment_id = (
            razorpay_payment_id
        )

        payment.status = Payment.Status.SUCCESS

        payment.save(
            update_fields=[
                "razorpay_payment_id",
                "status",
            ]
        )

        # Payment was successful, but the booking may have
        # already been cancelled by Celery.
        if booking.status == Booking.Status.CANCELLED:

            return {
                "paid": True,
                "booking_status": Booking.Status.CANCELLED,
                "message": (
                    "Payment was received, but the booking "
                    "had already been cancelled."
                ),
            }

        if booking.status == Booking.Status.CONFIRMED:

            if not hasattr(booking, "ticket"):
                TicketService.create_ticket(
                    booking
                )

            return {
                "paid": True,
                "booking_status": Booking.Status.CONFIRMED,
            }

        try:
            booking = BookingService.confirm_booking(
                booking
            )

        except ValidationError:
            return {
                "paid": True,
                "booking_status": booking.status,
                "message": (
                    "Payment was received, but the booking "
                    "could not be confirmed."
                ),
            }

        if not hasattr(
            booking,
            "ticket",
        ):
            TicketService.create_ticket(
                booking
            )

        return {
            "paid": True,
            "booking_status": Booking.Status.CONFIRMED,
        }

    @staticmethod
    @transaction.atomic
    def verify_payment(data):

        try:
            payment = (
                Payment.objects
                .select_related(
                    "booking"
                )
                .select_for_update()
                .get(
                    razorpay_order_id=data["razorpay_order_id"]
                )
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

        booking = (
            Booking.objects
            .select_for_update()
            .get(
                id=payment.booking_id
            )
        )

        # The payment signature is valid, but the booking
        # may have already been cancelled by Celery.
        if booking.status == Booking.Status.CANCELLED:

            payment.razorpay_payment_id = (
                data["razorpay_payment_id"]
            )

            payment.razorpay_signature = (
                data["razorpay_signature"]
            )

            payment.status = Payment.Status.SUCCESS

            payment.save(
                update_fields=[
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "status",
                ]
            )

            raise ValidationError(
                "Payment was successful, but this booking "
                "has already been cancelled."
            )

        payment.razorpay_payment_id = (
            data["razorpay_payment_id"]
        )

        payment.razorpay_signature = (
            data["razorpay_signature"]
        )

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

        if not hasattr(
            booking,
            "ticket",
        ):
            TicketService.create_ticket(
                booking
            )

        return payment

    @staticmethod
    @transaction.atomic
    def refund_payment(payment):

        payment = (
            Payment.objects
            .select_for_update()
            .select_related("booking")
            .get(
                id=payment.id
            )
        )

        # Prevent duplicate refunds from our application.
        if payment.status == Payment.Status.REFUNDED:
            return payment

        # A Razorpay payment ID is only available after
        # a successful payment.
        if not payment.razorpay_payment_id:
            raise ValidationError(
                "Cannot refund a payment without a Razorpay payment ID."
            )

        if payment.status != Payment.Status.SUCCESS:
            raise ValidationError(
                "Only successful payments can be refunded."
            )

        # Confirm the actual Razorpay payment is captured.
        razorpay_payment = client.payment.fetch(
            payment.razorpay_payment_id
        )

        if razorpay_payment.get("status") != "captured":
            raise ValidationError(
                "Payment has not been captured by Razorpay and cannot be refunded."
            )

        refund_amount = int(
            Decimal(payment.amount) * 100
        )

        # Deterministic idempotency key.
        #
        # If the request reaches Razorpay but our server
        # loses the response, retrying with the same key
        # will not create a duplicate refund.
        idempotency_key = (
            f"booking-refund-{payment.booking_id}"
        )

        refund_response = client.post(
            f"payments/{payment.razorpay_payment_id}/refund",
            {
                "amount": refund_amount,
            },
            headers={
                "X-Refund-Idempotency": idempotency_key,
            },
        )

        payment.razorpay_refund_id = refund_response["id"]
        payment.status = Payment.Status.REFUNDED

        payment.save(
            update_fields=[
                "razorpay_refund_id",
                "status",
            ]
        )

        return payment
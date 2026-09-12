import razorpay

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import transaction

from apps.bookings.models import Booking
from apps.bookings.services import BookingService
from apps.events.models import EventSection
from apps.notifications.services import NotificationService
from apps.tickets.services import TicketService

from .models import Payment


class PaymentService:

    @staticmethod
    @transaction.atomic
    def create_payment_link(user, booking_id):
        try:
            booking = (
                Booking.objects
                .select_for_update()
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
            raise ValidationError("Booking not found.")

        if booking.status != Booking.Status.PENDING:
            raise ValidationError(
                "Payment can only be created for a pending booking."
            )

        existing_payment = Payment.objects.filter(
            booking=booking
        ).first()

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        if existing_payment:
            if existing_payment.status == Payment.Status.SUCCESS:
                raise ValidationError(
                    "Payment has already been completed."
                )

            if existing_payment.status == Payment.Status.REFUNDED:
                raise ValidationError(
                    "This payment has already been refunded."
                )

            payment_link = client.payment_link.fetch(
                existing_payment.razorpay_order_id
            )

            return {
                "payment": existing_payment,
                "payment_link": payment_link,
            }

        try:
            event_section = EventSection.objects.get(
                event=booking.event,
                section=booking.seat.section,
            )
        except EventSection.DoesNotExist:
            raise ValidationError(
                "Price could not be determined for this booking."
            )

        amount = event_section.price

        payment_link = client.payment_link.create(
            {
                "amount": int(amount * 100),
                "currency": "INR",
                "description": (
                    f"Event booking - {booking.event.title}"
                ),
                "customer": {
                    "name": (
                        f"{booking.user.first_name} "
                        f"{booking.user.last_name}"
                    ).strip(),
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
            status=Payment.Status.CREATED,
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
                .select_for_update()
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
            raise ValidationError("Booking not found.")

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .get(booking=booking)
            )
        except Payment.DoesNotExist:
            raise ValidationError("Payment not found.")

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        payment_link = client.payment_link.fetch(
            payment.razorpay_order_id
        )

        payment_status = payment_link.get("status")

        if payment_status != "paid":
            return {
                "paid": False,
                "status": payment_status,
                "booking_status": booking.status,
                "message": "Payment has not been completed yet.",
            }

        payments = payment_link.get("payments") or []

        if not payments:
            return {
                "paid": False,
                "status": payment_status,
                "booking_status": booking.status,
                "message": (
                    "Payment was marked paid, but payment "
                    "details were not found."
                ),
            }

        razorpay_payment_id = payments[0].get("payment_id")

        was_successful = (
            payment.status == Payment.Status.SUCCESS
        )

        payment.razorpay_payment_id = razorpay_payment_id
        payment.status = Payment.Status.SUCCESS

        payment.save(
            update_fields=[
                "razorpay_payment_id",
                "status",
                "updated_at",
            ]
        )

        # Create payment notification only once.
        if not was_successful:
            NotificationService.payment_successful(payment)

        # Do not confirm a booking that was already cancelled.
        if booking.status == Booking.Status.CANCELLED:
            return {
                "paid": True,
                "status": payment.status,
                "booking_status": booking.status,
                "message": (
                    "Payment was successful, but this booking "
                    "has already been cancelled."
                ),
            }

        # Booking was already confirmed.
        if booking.status == Booking.Status.CONFIRMED:
            if not hasattr(booking, "ticket"):
                TicketService.create_ticket(booking)

            return {
                "paid": True,
                "status": payment.status,
                "booking_status": booking.status,
                "message": (
                    "Payment successful. Booking is confirmed."
                ),
            }

        try:
            booking = BookingService.confirm_booking(booking)

        except ValidationError as exc:
            return {
                "paid": True,
                "status": payment.status,
                "booking_status": booking.status,
                "message": str(exc),
            }

        if booking.status == Booking.Status.CONFIRMED:
            if not hasattr(booking, "ticket"):
                TicketService.create_ticket(booking)

        return {
            "paid": True,
            "status": payment.status,
            "booking_status": booking.status,
            "message": (
                "Payment successful. Booking is confirmed."
            ),
        }

    @staticmethod
    @transaction.atomic
    def verify_payment(data):
        razorpay_order_id = data.get("razorpay_order_id")
        razorpay_payment_id = data.get("razorpay_payment_id")
        razorpay_signature = data.get("razorpay_signature")

        if not all(
            [
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ]
        ):
            raise ValidationError(
                "Missing payment verification details."
            )

        try:
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("booking")
                .get(
                    razorpay_order_id=razorpay_order_id
                )
            )
        except Payment.DoesNotExist:
            raise ValidationError("Payment not found.")

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except razorpay.errors.SignatureVerificationError:
            raise ValidationError(
                "Payment signature verification failed."
            )

        was_successful = (
            payment.status == Payment.Status.SUCCESS
        )

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = Payment.Status.SUCCESS

        payment.save(
            update_fields=[
                "razorpay_payment_id",
                "razorpay_signature",
                "status",
                "updated_at",
            ]
        )

        booking = (
            Booking.objects
            .select_for_update()
            .select_related(
                "event",
                "seat",
                "seat__section",
            )
            .get(id=payment.booking_id)
        )

        # Payment succeeded after the booking was cancelled.
        if booking.status == Booking.Status.CANCELLED:
            if not was_successful:
                NotificationService.payment_successful(payment)

            return payment

        # Booking is already confirmed.
        if booking.status == Booking.Status.CONFIRMED:
            if not was_successful:
                NotificationService.payment_successful(payment)

            if not hasattr(booking, "ticket"):
                TicketService.create_ticket(booking)

            return payment

        booking = BookingService.confirm_booking(booking)

        if booking.status == Booking.Status.CONFIRMED:
            if not hasattr(booking, "ticket"):
                TicketService.create_ticket(booking)

        # Send payment notification only once.
        if not was_successful:
            NotificationService.payment_successful(payment)

        return payment

    @staticmethod
    @transaction.atomic
    def refund_payment(payment):
        payment = (
            Payment.objects
            .select_for_update()
            .select_related("booking")
            .get(id=payment.id)
        )

        if payment.status == Payment.Status.REFUNDED:
            return payment

        if not payment.razorpay_payment_id:
            raise ValidationError(
                "Payment ID is missing. Refund cannot be processed."
            )

        if payment.status != Payment.Status.SUCCESS:
            raise ValidationError(
                "Only successful payments can be refunded."
            )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET,
            )
        )

        razorpay_payment = client.payment.fetch(
            payment.razorpay_payment_id
        )

        if razorpay_payment.get("status") != "captured":
            raise ValidationError(
                "Payment has not been captured and cannot be refunded."
            )

        refund_amount = int(payment.amount * 100)

        idempotency_key = (
            f"booking-refund-{payment.booking_id}"
        )

        refund_response = client.payment.refund(
            payment.razorpay_payment_id,
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
                "updated_at",
            ]
        )

        return payment
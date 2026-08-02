from .models import Payment


def get_payment_by_booking(booking):
    return (
        Payment.objects
        .filter(booking=booking)
        .first()
    )
from .client import client


def create_payment_link(
    booking_id,
    token,
):

    response = client.post(
        "/payments/create-order/",
        {
            "booking_id": booking_id,
        },
        token,
    )

    if response.status_code == 200:

        return response.json()

    return None


def verify_payment(
    order_id,
    payment_id,
    signature,
    token,
):

    response = client.post(
        "/payments/verify/",
        {
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        },
        token,
    )

    return response

def check_payment_status(
    booking_id,
    token,
):

    response = client.post(
        "/payments/status/",
        {
            "booking_id": booking_id,
        },
        token,
    )

    return response
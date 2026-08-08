import webbrowser

import streamlit as st

from api.payments import (
    create_payment_link,
    check_payment_status,
)

from utils.helpers import (
    require_login,
    logout_button,
)


require_login()

logout_button()


# ---------------------------------------
# Check required session data
# ---------------------------------------

event = st.session_state.get(
    "selected_event"
)

seat = st.session_state.get(
    "selected_seat"
)

booking = st.session_state.get(
    "booking"
)


if not event:
    st.warning(
        "No event selected."
    )
    st.stop()


if not seat:
    st.warning(
        "No seat selected."
    )
    st.stop()


if not booking:
    st.warning(
        "No booking found."
    )
    st.stop()


# ---------------------------------------
# Checkout
# ---------------------------------------

st.title("💳 Checkout")

st.subheader(
    event["title"]
)

st.write(
    f"📍 {event['venue']}"
)

st.divider()


# ---------------------------------------
# Booking Details
# ---------------------------------------

c1, c2 = st.columns(2)

c1.metric(
    "Row",
    seat["row"],
)

c2.metric(
    "Seat",
    seat["seat_number"],
)


st.info(
    f"Section: {seat['section']}"
)


st.divider()


# ---------------------------------------
# Create Payment Link
# ---------------------------------------

if "payment" not in st.session_state:

    if st.button(
        "💳 Generate Payment Link",
        use_container_width=True,
    ):

        with st.spinner(
            "Creating payment..."
        ):

            payment = create_payment_link(
                booking["id"],
                st.session_state.access_token,
            )

        if payment:

            st.session_state.payment = payment

            st.success(
                "Payment link created successfully!"
            )

            st.rerun()

        else:

            st.error(
                "Unable to create payment link."
            )


# ---------------------------------------
# Payment Section
# ---------------------------------------

if "payment" in st.session_state:

    payment = st.session_state.payment

    st.success(
        "Your payment page is ready."
    )

    st.link_button(
        "💳 Open Razorpay Payment",
        payment["payment_link"],
        use_container_width=True,
    )

    st.divider()

    st.info(
        "Complete the payment on Razorpay, "
        "then return here and click the button below."
    )


    # -----------------------------------
    # Check Payment
    # -----------------------------------

    if st.button(
        "✅ I've Completed Payment",
        use_container_width=True,
    ):

        with st.spinner(
            "Checking payment status..."
        ):

            response = check_payment_status(
                booking["id"],
                st.session_state.access_token,
            )


        if response.status_code == 200:

            data = response.json()

            if data.get("paid"):

                st.success(
                    "🎉 Payment successful!"
                )

                st.success(
                    "🎟 Your ticket has been generated."
                )

                # Clear payment state
                st.session_state.pop(
                    "payment",
                    None,
                )

                # Move to tickets
                st.session_state.go_to_tickets = True

                st.rerun()

            else:

                st.warning(
                    "Payment has not been completed yet."
                )

                st.info(
                    "Complete the payment on Razorpay "
                    "and try again."
                )

        else:

            try:

                error = response.json()

                st.error(error)

            except Exception:

                st.error(
                    response.text
                )


# ---------------------------------------
# Redirect to My Tickets
# ---------------------------------------

if st.session_state.get(
    "go_to_tickets",
    False,
):

    st.session_state.go_to_tickets = False

    st.switch_page(
        "pages/5_My_Tickets.py"
    )
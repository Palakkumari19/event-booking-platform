import webbrowser

import streamlit as st

from api.payments import create_payment_link

from utils.helpers import (
    logout_button,
    require_login,
)

require_login()

logout_button()

event = st.session_state.selected_event
seat = st.session_state.selected_seat
booking = st.session_state.booking

st.title("💳 Checkout")

st.subheader(event["title"])

st.write(f"📍 {event['venue']}")

st.divider()

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

if st.button(
    "💳 Generate Payment Link",
    use_container_width=True,
):

    payment = create_payment_link(
        booking["id"],
        st.session_state.access_token,
    )

    if payment is None:

        st.error(
            "Unable to create payment."
        )

        st.stop()

    st.session_state.payment = payment

    st.success(
        "Payment Link Created!"
    )

    webbrowser.open(
        payment["payment_link"]
    )
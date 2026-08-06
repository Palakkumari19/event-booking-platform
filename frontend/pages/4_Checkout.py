import streamlit as st

from utils.helpers import (
    require_login,
    logout_button,
)

require_login()

logout_button()

event = st.session_state.get("selected_event")
seat = st.session_state.get("selected_seat")

if not event or not seat:

    st.warning(
        "No seat selected."
    )

    st.stop()

st.title("💳 Checkout")

st.subheader(event["title"])

st.write(
    f"📍 {event['venue']}"
)

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

st.success(
    "Payment page coming next 🚀"
)
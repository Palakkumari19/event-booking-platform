import streamlit as st

from api.events import get_events
from components.event_card import event_card
from utils.helpers import (
    require_login,
    logout_button,
)

require_login()

logout_button()

st.title("🎟 Available Events")

events = get_events(
    st.session_state.access_token
)

if events is None:

    st.error("Couldn't fetch events.")

    st.stop()

if len(events) == 0:

    st.info("No events available.")

    st.stop()

for event in events:

    clicked = event_card(event)

    if clicked:

        st.session_state.selected_event = event

        st.success(
            f"{event['title']} selected!"
        )

        st.switch_page(
            "pages/3_Seat_Selection.py"
        )
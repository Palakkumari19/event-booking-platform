import streamlit as st

from api.bookings import (
    get_event_seats,
    hold_seat,
    create_booking,
)
from components.seat_grid import seat_grid
from utils.helpers import (
    require_login,
    logout_button,
)

require_login()

logout_button()

# ---------------------------------------
# Redirect to checkout if requested
# ---------------------------------------
if st.session_state.get("go_to_checkout", False):
    st.session_state.go_to_checkout = False
    st.switch_page("pages/4_Checkout.py")

# ---------------------------------------
# Selected Event
# ---------------------------------------
event = st.session_state.get("selected_event")

if not event:
    st.warning("Please select an event first.")
    st.stop()

st.title(event["title"])
st.write(f"📍 {event['venue']}")

# ---------------------------------------
# Fetch Seats
# ---------------------------------------
seats = get_event_seats(
    event["id"],
    st.session_state.access_token,
)

if seats is None:
    st.error("Couldn't fetch seats.")
    st.stop()

# ---------------------------------------
# Seat Grid
# ---------------------------------------
selected = seat_grid(seats)

# ---------------------------------------
# Hold Seat
# ---------------------------------------
if selected:

    response = hold_seat(
        event["id"],
        selected["id"],
        st.session_state.access_token,
    )

    if response.status_code == 200:

        data = response.json()

        st.session_state.selected_event = event
        st.session_state.selected_seat = selected
        st.session_state.hold_time = data["expires_in"]

        st.success("Seat held successfully!")

        # Refresh to show booking summary
        st.rerun()

    else:

        try:
            error = response.json()

            if isinstance(error, dict):
                error = "\n".join(
                    f"{k}: {v}"
                    for k, v in error.items()
                )

            st.error(error)

        except Exception:
            st.error(response.text)

# ---------------------------------------
# Booking Summary
# ---------------------------------------
if "selected_seat" in st.session_state:

    seat = st.session_state.selected_seat

    st.divider()

    st.subheader("🎟 Booking Summary")

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

    st.warning(
        f"Seat reserved for {st.session_state.hold_time} seconds."
    )

    if st.button(
        "Continue to Checkout ➜",
        use_container_width=True,
    ):

        booking_response = create_booking(
            event["id"],
            seat["id"],
            st.session_state.access_token,
        )

        if booking_response.status_code == 201:

            booking = booking_response.json()

            st.session_state.booking = booking
            st.session_state.booking_id = booking["id"]

            st.session_state.go_to_checkout = True

            st.rerun()

        else:

            try:
                st.error(
                    booking_response.json()
                )

            except Exception:
                st.error(
                    booking_response.text
                )
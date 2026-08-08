import streamlit as st

from api.bookings import (
    get_my_bookings,
)
from components.booking_card import (
    booking_card,
)
from utils.helpers import (
    require_login,
    logout_button,
)


require_login()

logout_button()


# =====================================================
# PAGE TITLE
# =====================================================

st.title("📚 My Bookings")

token = st.session_state.access_token


# =====================================================
# FETCH BOOKINGS
# =====================================================

bookings = get_my_bookings(token)


# =====================================================
# EMPTY STATE
# =====================================================

if not bookings:

    st.info(
        "You don't have any bookings yet."
    )

    if st.button(
        "Browse Events →",
        use_container_width=True,
    ):

        st.switch_page(
            "pages/2_Events.py"
        )

    st.stop()


# =====================================================
# SUMMARY
# =====================================================

st.write(
    f"You have **{len(bookings)}** booking(s)."
)

st.divider()


# =====================================================
# BOOKINGS
# =====================================================

for booking in bookings:

    action = booking_card(
        booking
    )

    if action == "cancel":

        st.session_state.booking_to_cancel = (
            booking["id"]
        )

        st.rerun()


# =====================================================
# CANCEL CONFIRMATION
# =====================================================

booking_id = st.session_state.get(
    "booking_to_cancel"
)


if booking_id:

    st.divider()

    st.warning(
        "Are you sure you want to cancel this booking?"
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button(
            "Yes, Cancel Booking",
            use_container_width=True,
        ):

            from api.bookings import (
                cancel_booking,
            )

            response = cancel_booking(
                booking_id,
                token,
            )

            if response.status_code == 200:

                st.session_state.pop(
                    "booking_to_cancel",
                    None,
                )

                st.success(
                    "Booking cancelled successfully!"
                )

                st.rerun()

            else:

                try:
                    error = response.json()

                    st.error(
                        error
                    )

                except Exception:

                    st.error(
                        response.text
                    )

    with col2:

        if st.button(
            "No, Keep Booking",
            use_container_width=True,
        ):

            st.session_state.pop(
                "booking_to_cancel",
                None,
            )

            st.rerun()
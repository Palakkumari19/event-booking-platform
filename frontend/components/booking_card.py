import streamlit as st


def booking_card(booking):

    event = booking["event"]

    st.subheader(
        f"🎟️ {event['title']}"
    )

    col1, col2 = st.columns(2)

    with col1:

        st.write(
            f"📍 **Venue:** {booking['venue']}"
        )

        st.write(
            f"💺 **Seat:** {booking['seat']}"
        )

    with col2:

        st.write(
            f"💰 **Price:** ₹{booking['price']}"
        )

        st.write(
            f"📌 **Status:** {booking['status']}"
        )

    st.caption(
        f"Booked at: {booking['booked_at']}"
    )

    # -----------------------------------------
    # Cancel Booking
    # -----------------------------------------

    if booking["status"] not in (
        "CANCELLED",
        "COMPLETED",
    ):

        if st.button(
            "Cancel Booking",
            key=f"cancel_{booking['id']}",
            use_container_width=True,
        ):

            return "cancel"

    st.divider()

    return None
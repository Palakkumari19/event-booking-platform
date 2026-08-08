import streamlit as st

from api.tickets import (
    get_my_tickets,
    get_ticket,
)
from components.ticket_card import ticket_card
from utils.helpers import (
    require_login,
    logout_button,
)


require_login()

logout_button()


# =====================================================
# PAGE TITLE
# =====================================================

st.title("🎟️ My Tickets")


token = st.session_state.access_token


# =====================================================
# SELECTED TICKET
# =====================================================

selected_ticket_id = st.session_state.get(
    "selected_ticket_id"
)


# =====================================================
# TICKET DETAIL VIEW
# =====================================================

if selected_ticket_id:

    ticket = get_ticket(
        selected_ticket_id,
        token,
    )

    if not ticket:

        st.error(
            "Could not load ticket."
        )

        if st.button("← Back to My Tickets"):

            st.session_state.pop(
                "selected_ticket_id",
                None,
            )

            st.rerun()

        st.stop()


    # -----------------------------------------
    # Back button
    # -----------------------------------------

    if st.button("← Back to My Tickets"):

        st.session_state.pop(
            "selected_ticket_id",
            None,
        )

        st.rerun()


    st.divider()


    # -----------------------------------------
    # Event
    # -----------------------------------------

    event = ticket["event"]
    seat = ticket["seat"]

    st.header(
        event["title"]
    )

    st.write(
        f"📍 {event['venue']}"
    )


    # -----------------------------------------
    # Ticket Number
    # -----------------------------------------

    st.info(
        f"🎫 Ticket Number: "
        f"**{ticket['ticket_number']}**"
    )


    # -----------------------------------------
    # Event Information
    # -----------------------------------------

    st.subheader("🎵 Event Details")

    col1, col2 = st.columns(2)

    with col1:

        st.write("📍 **Venue**")

        st.write(
            event["venue"]
        )

    with col2:

        st.write("🕐 **Start Time**")

        st.write(
            str(event["start_time"])
        )


    st.divider()


    # -----------------------------------------
    # Seat Information
    # -----------------------------------------

    st.subheader("💺 Seat Details")

    col1, col2, col3 = st.columns(3)

    with col1:

        st.metric(
            "Section",
            seat["section"],
        )

    with col2:

        st.metric(
            "Row",
            seat["row"],
        )

    with col3:

        st.metric(
            "Seat",
            seat["seat_number"],
        )


    st.divider()


    # -----------------------------------------
    # Status
    # -----------------------------------------

    st.subheader("📌 Ticket Status")

    st.success(
        ticket["status"]
    )


    # -----------------------------------------
    # QR Code
    # -----------------------------------------

    st.divider()

    st.subheader("📱 Your Ticket QR Code")

    qr_code = ticket.get(
        "qr_code"
    )

    if qr_code:

        st.image(
            qr_code,
            width=300,
        )

        st.caption(
            "Show this QR code at the event entrance."
        )

    else:

        st.warning(
            "QR code is not available yet."
        )


    st.divider()

    st.caption(
        f"Issued at: {ticket['issued_at']}"
    )


    st.stop()


# =====================================================
# MY TICKETS LIST
# =====================================================

tickets = get_my_tickets(token)


if not tickets:

    st.info(
        "You don't have any tickets yet."
    )

    if st.button(
        "Browse Events →",
        use_container_width=True,
    ):

        st.switch_page(
            "pages/2_Events.py"
        )

    st.stop()


st.write(
    f"You have **{len(tickets)}** ticket(s)."
)


for ticket in tickets:

    ticket_card(ticket)
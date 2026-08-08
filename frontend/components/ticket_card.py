import streamlit as st


def ticket_card(ticket):

    st.subheader(
        f"🎟️ {ticket['event']}"
    )

    col1, col2 = st.columns(2)

    with col1:
        st.write(
            f"📍 **Venue:** {ticket['venue']}"
        )

        st.write(
            f"💺 **Seat:** {ticket['seat']}"
        )

    with col2:
        st.write(
            f"🎫 **Ticket:** {ticket['ticket_number']}"
        )

        st.write(
            f"📌 **Status:** {ticket['status']}"
        )

    if st.button(
        "View Ticket →",
        key=f"ticket_{ticket['id']}",
        use_container_width=True,
    ):
        st.session_state.selected_ticket_id = ticket["id"]
        st.rerun()

    st.divider()
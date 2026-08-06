import streamlit as st


def event_card(event):

    with st.container(border=True):

        st.subheader(f"🎉 {event['title']}")

        st.write(f"📍 **Venue:** {event['venue']}")

        st.write(f"🗓 **Starts:** {event['start_time'][:10]}")

        st.write(event["description"])

        col1, col2 = st.columns([5, 1])

        with col2:

            if st.button(
                "Book",
                key=f"book_{event['id']}",
                use_container_width=True,
            ):
                return True

    return False
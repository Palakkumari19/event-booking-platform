import streamlit as st

from utils.session import initialize_session

st.set_page_config(
    page_title="Event Booking Platform",
    page_icon="🎟️",
    layout="wide",
)

initialize_session()

st.title("🎟️ Event Booking Platform")

st.write(
    """
    Welcome!

    Use the sidebar to navigate through the application.
    """
)

if st.session_state.authenticated:
    st.success("Logged in successfully.")
else:
    st.info("Please login using the Login page.")
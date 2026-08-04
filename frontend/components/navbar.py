import streamlit as st

from utils.session import logout


def navbar():

    st.sidebar.title("🎟️ Event Booking")

    if st.session_state.authenticated:

        st.sidebar.success("Logged In")

        if st.sidebar.button("Logout"):

            logout()

            st.rerun()
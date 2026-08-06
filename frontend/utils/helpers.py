import streamlit as st

from utils.session import logout


def require_login():

    if not st.session_state.authenticated:
        st.warning("Please login first.")
        st.stop()


def logout_button():

    if st.sidebar.button("🚪 Logout"):
        logout()
        st.rerun()
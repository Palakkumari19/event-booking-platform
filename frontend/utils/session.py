import streamlit as st


DEFAULTS = {
    "authenticated": False,
    "access_token": None,
    "refresh_token": None,
    "selected_event": None,
    "selected_seat": None,
}


def initialize_session():
    for key, value in DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = value


def login(access_token, refresh_token):
    st.session_state.authenticated = True
    st.session_state.access_token = access_token
    st.session_state.refresh_token = refresh_token


def logout():
    for key, value in DEFAULTS.items():
        st.session_state[key] = value
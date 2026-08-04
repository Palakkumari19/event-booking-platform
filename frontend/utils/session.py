import streamlit as st


DEFAULT_SESSION = {
    "access_token": None,
    "refresh_token": None,
    "user": None,
    "authenticated": False,
}


def initialize_session():

    for key, value in DEFAULT_SESSION.items():
        if key not in st.session_state:
            st.session_state[key] = value


def login(access, refresh):

    st.session_state.access_token = access
    st.session_state.refresh_token = refresh
    st.session_state.authenticated = True


def logout():

    for key, value in DEFAULT_SESSION.items():
        st.session_state[key] = value
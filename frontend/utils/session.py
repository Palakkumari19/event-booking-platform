import streamlit as st


def initialize_session():

    defaults = {
        "access_token": None,
        "refresh_token": None,
        "user": None,
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value
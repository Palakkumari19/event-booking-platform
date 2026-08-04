import streamlit as st

from components.navbar import navbar
from pages.Events import *
from pages.Login import *
from utils.session import initialize_session


st.set_page_config(
    page_title="Event Booking Platform",
    page_icon="🎟️",
    layout="wide",
)

initialize_session()

navbar()

if st.session_state.authenticated:

    Events()

else:

    Login()
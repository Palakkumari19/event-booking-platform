import streamlit as st

from utils.helpers import (
    require_login,
    logout_button,
)

require_login()

logout_button()

st.title("🎉 my ticket")

st.success("Logged in successfully.")

st.info("Events UI coming next.")
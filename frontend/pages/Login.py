import streamlit as st

from api.auth import login
from utils.session import login as save_login


def Login():

    st.title("🎟️ Login")

    email = st.text_input("Email")

    password = st.text_input(
        "Password",
        type="password",
    )

    if st.button("Login"):

        response = login(
            email,
            password,
        )

        if response.status_code == 200:

            data = response.json()

            save_login(
                data["access"],
                data["refresh"],
            )

            st.success("Login Successful!")

            st.rerun()

        else:

            st.error(
                "Invalid credentials."
            )
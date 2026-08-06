import streamlit as st

from api.auth import login
from utils.session import login as save_login


st.title("🔐 Login")

st.write("Login with your account.")

email = st.text_input("Email")

password = st.text_input(
    "Password",
    type="password",
)

if st.button(
    "Login",
    use_container_width=True,
):

    response = login(
        email,
        password,
    )

    if response.status_code == 200:

        tokens = response.json()

        save_login(
            tokens["access"],
            tokens["refresh"],
        )

        st.success(
            "Login successful!"
        )

        st.rerun()

    else:

        st.error(
            "Invalid email or password."
        )
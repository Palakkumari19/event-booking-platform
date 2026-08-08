import streamlit as st

from api.auth import get_current_user

from utils.helpers import (
    require_login,
    logout_button,
)


require_login()

logout_button()


# =====================================================
# PAGE TITLE
# =====================================================

st.title("👤 My Profile")

token = st.session_state.access_token


# =====================================================
# FETCH USER
# =====================================================

user = get_current_user(token)


if not user:

    st.error(
        "Unable to load your profile."
    )

    st.stop()


# =====================================================
# PROFILE HEADER
# =====================================================

st.subheader(
    "Account Information"
)

st.divider()


# =====================================================
# USER DETAILS
# =====================================================

# We display the fields returned by UserSerializer.
# Using .get() prevents the page from crashing if
# a field isn't present in the serializer.

first_name = user.get(
    "first_name",
    "",
)

last_name = user.get(
    "last_name",
    "",
)

username = user.get(
    "username",
    "",
)

email = user.get(
    "email",
    "",
)

role = user.get(
    "role",
    "",
)


# =====================================================
# NAME
# =====================================================

full_name = (
    f"{first_name} {last_name}"
).strip()


if full_name:

    st.header(
        f"👋 {full_name}"
    )

else:

    st.header(
        f"👋 {username}"
    )


st.divider()


# =====================================================
# DETAILS
# =====================================================

col1, col2 = st.columns(2)


with col1:

    st.write("**Username**")

    st.info(
        username or "Not provided"
    )


with col2:

    st.write("**Email**")

    st.info(
        email or "Not provided"
    )


col3, col4 = st.columns(2)


with col3:

    st.write("**Role**")

    st.info(
        role or "Not provided"
    )


with col4:

    st.write("**User ID**")

    st.info(
        str(user.get("id", "N/A"))
    )


st.divider()


# =====================================================
# ACCOUNT STATUS
# =====================================================

st.subheader(
    "Account Status"
)

st.success(
    "✓ Authenticated"
)
import streamlit as st
from collections import defaultdict


def seat_grid(seats):

    grouped = defaultdict(list)

    for seat in seats:
        grouped[seat["row"]].append(seat)

    st.markdown("## 🎬 SCREEN")

    st.divider()

    selected = None

    for row in sorted(grouped.keys()):

        cols = st.columns(len(grouped[row]) + 1)

        cols[0].markdown(f"**{row}**")

        for i, seat in enumerate(grouped[row], start=1):

            status = seat["status"]

            if status == "BOOKED":
                label = f"🔴 {seat['seat_number']}"
                disabled = True

            elif status == "HELD":
                label = f"🟡 {seat['seat_number']}"
                disabled = True

            else:
                label = f"🟢 {seat['seat_number']}"
                disabled = False

            if cols[i].button(
                label,
                key=f"seat_{seat['id']}",
                disabled=disabled,
                use_container_width=True,
            ):
                selected = seat

    st.divider()

    c1, c2, c3 = st.columns(3)

    c1.success("🟢 Available")

    c2.error("🔴 Booked")

    c3.warning("🟡 Held")

    return selected
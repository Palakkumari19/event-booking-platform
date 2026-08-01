from django.urls import path

from .views import (
    BookingCreateView,
    CancelBookingView,
    MyBookingsView,
    SeatAvailabilityView,
    SeatHoldView,
    SeatHoldStatusView,
)

urlpatterns = [
    path(
        "seats/",
        SeatAvailabilityView.as_view(),
        name="seat-availability",
    ),

    path(
        "",
        BookingCreateView.as_view(),
        name="booking-create",
    ),

    path(
        "my-bookings/",
        MyBookingsView.as_view(),
        name="my-bookings",
    ),

    path(
        "<int:booking_id>/cancel/",
        CancelBookingView.as_view(),
        name="cancel-booking",
    ),

    path(
        "hold/",
        SeatHoldView.as_view(),
        name="seat-hold",
    ),

    path(
        "hold-status/",
        SeatHoldStatusView.as_view(),
    ),
]
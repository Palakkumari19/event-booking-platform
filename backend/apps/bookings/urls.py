from django.urls import path

from .views import (
    BookingCreateView,
    MyBookingsView,
    SeatAvailabilityView,
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
]
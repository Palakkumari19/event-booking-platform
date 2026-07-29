from django.urls import path

from .views import SeatAvailabilityView

urlpatterns = [
    path(
        "seats/",
        SeatAvailabilityView.as_view(),
        name="seat-availability",
    ),
]
from django.urls import path

from .views import (
    VenueListView,
    VenueSectionListView,
)


urlpatterns = [
    path(
        "",
        VenueListView.as_view(),
        name="venue-list",
    ),

    path(
        "<int:venue_id>/sections/",
        VenueSectionListView.as_view(),
        name="venue-sections",
    ),
]
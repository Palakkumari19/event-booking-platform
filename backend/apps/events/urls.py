from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    EventSeatListView,
)

urlpatterns = [
    path(
        "",
        EventListView.as_view(),
        name="event-list",
    ),

    path(
        "<int:pk>/",
        EventDetailView.as_view(),
        name="event-detail",
    ),

    path(
        "<int:event_id>/seats/",
        EventSeatListView.as_view(),
        name="event-seats",
    ),
]
from django.urls import path

from .views import (
    EventDetailView,
    EventListView,
    EventSeatListView,
    OrganizerEventListView,
    OrganizerEventCreateView,
    OrganizerEventDetailView,
    OrganizerPublishEventView,
    OrganizerCancelEventView,
)

urlpatterns = [
    path(
        "",
        EventListView.as_view(),
        name="event-list",
    ),

    path(
        "organizer/",
        OrganizerEventListView.as_view(),
        name="organizer-event-list",
    ),

    path(
        "organizer/create/",
        OrganizerEventCreateView.as_view(),
        name="organizer-event-create",
    ),

    path(
        "organizer/<int:pk>/",
        OrganizerEventDetailView.as_view(),
        name="organizer-event-detail",
    ),

    path(
        "organizer/<int:event_id>/publish/",
        OrganizerPublishEventView.as_view(),
        name="organizer-event-publish",
    ),

    path(
        "organizer/<int:event_id>/cancel/",
        OrganizerCancelEventView.as_view(),
        name="organizer-event-cancel",
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
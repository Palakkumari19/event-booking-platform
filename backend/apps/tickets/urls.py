from django.urls import path

from .views import (
    MyTicketsView,
    TicketDetailView,
)

urlpatterns = [
    path(
        "my-tickets/",
        MyTicketsView.as_view(),
        name="my-tickets",
    ),
    path(
        "<int:ticket_id>/",
        TicketDetailView.as_view(),
        name="ticket-detail",
    ),
]
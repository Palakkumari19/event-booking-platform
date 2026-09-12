from django.urls import path

from .views import (
    MyTicketsView,
    TicketDetailView,
    TicketValidationView,
)

urlpatterns = [
    path(
        "my-tickets/",
        MyTicketsView.as_view(),
        name="my-tickets",
    ),
    path(
        "validate/",
        TicketValidationView.as_view(),
        name="ticket-validate",
    ),
    path(
        "<int:ticket_id>/",
        TicketDetailView.as_view(),
        name="ticket-detail",
    ),
]
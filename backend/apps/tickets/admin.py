from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):

    list_display = (
        "ticket_number",
        "booking",
        "status",
        "issued_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "ticket_number",
        "booking__user__email",
        "booking__event__title",
    )

    readonly_fields = (
        "ticket_number",
        "issued_at",
        "checked_in_at",
    )
from django.contrib import admin

from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):

    list_display = (
        "ticket_number",
        "booking",
        "ticket_status",
        "issued_at",
        "checked_in_at",
    )

    search_fields = (
        "ticket_number",
        "booking__user__email",
        "booking__event__title",
        "booking__seat__row",
        "booking__seat__section__name",
    )

    list_filter = (
        "status",
        "issued_at",
        "checked_in_at",
    )

    ordering = (
        "-issued_at",
    )

    list_select_related = (
        "booking",
        "booking__user",
        "booking__event",
        "booking__seat",
    )

    readonly_fields = (
        "booking",
        "ticket_number",
        "qr_code",
        "status",
        "issued_at",
        "checked_in_at",
    )

    fieldsets = (
        (
            "Ticket Information",
            {
                "fields": (
                    "ticket_number",
                    "booking",
                    "status",
                )
            },
        ),
        (
            "QR Code",
            {
                "fields": (
                    "qr_code",
                )
            },
        ),
        (
            "Check-in",
            {
                "fields": (
                    "issued_at",
                    "checked_in_at",
                )
            },
        ),
    )

    @admin.display(description="Status")
    def ticket_status(self, obj):
        return obj.status
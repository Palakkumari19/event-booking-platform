from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "event",
        "seat",
        "status",
        "booked_at",
        "payment_status",
        "ticket_status",
    )

    search_fields = (
        "user__email",
        "event__title",
        "seat__row",
        "seat__section__name",
    )

    list_filter = (
        "status",
        "event",
        "booked_at",
    )

    ordering = (
        "-booked_at",
    )

    list_select_related = (
        "user",
        "event",
        "seat",
        "seat__section",
    )

    readonly_fields = (
        "user",
        "event",
        "seat",
        "status",
        "booked_at",
    )

    @admin.display(description="Payment")
    def payment_status(self, obj):
        if hasattr(obj, "payment"):
            return obj.payment.status

        return "—"

    @admin.display(description="Ticket")
    def ticket_status(self, obj):
        if hasattr(obj, "ticket"):
            return obj.ticket.status

        return "—"
from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "event",
        "seat",
        "status",
        "booked_at",
    )

    search_fields = (
        "user__email",
        "event__title",
    )

    list_filter = (
        "status",
        "event",
    )

    ordering = (
        "-booked_at",
    )
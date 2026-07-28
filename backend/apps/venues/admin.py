from django.contrib import admin

from .models import Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "city",
        "state",
        "country",
        "updated_at",
    )

    search_fields = (
        "name",
        "city",
        "state",
    )

    list_filter = (
        "country",
        "state",
    )

    ordering = ("name",)
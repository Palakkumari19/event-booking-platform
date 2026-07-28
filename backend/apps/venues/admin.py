from django.contrib import admin, messages

from .models import Venue, Section, Seat
from .utils import generate_seats


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

@admin.action(description="Generate sample seats")
def generate_sample_seats(modeladmin, request, queryset):
    for section in queryset:
        generate_seats(section, "A", "D", 10)

    messages.success(request, "Seats generated successfully.")


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "venue",
        "display_order",
    )

    search_fields = (
        "name",
        "venue__name",
    )

    list_filter = (
        "venue",
    )

    ordering = (
        "venue",
        "display_order",
    )

    actions = [generate_sample_seats]

@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = (
        "section",
        "row",
        "seat_number",
        "is_active",
    )

    search_fields = (
        "section__name",
        "row",
    )

    list_filter = (
        "section",
        "is_active",
    )

    ordering = (
        "section",
        "row",
        "seat_number",
    )


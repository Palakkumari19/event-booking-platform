from django.contrib import admin, messages

from .models import Venue, Section, Seat
from .utils import generate_seats


class SectionInline(admin.TabularInline):
    model = Section
    extra = 1
    fields = (
        "name",
        "display_order",
    )


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
        "address",
        "city",
        "state",
        "country",
        "postal_code",
    )

    list_filter = (
        "country",
        "state",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Venue Information",
            {
                "fields": (
                    "name",
                    "description",
                )
            },
        ),
        (
            "Location",
            {
                "fields": (
                    "address",
                    "city",
                    "state",
                    "country",
                    "postal_code",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    inlines = [
        SectionInline,
    ]


@admin.action(description="Generate sample seats (A-D, 10 per row)")
def generate_sample_seats(modeladmin, request, queryset):
    total_created = 0

    for section in queryset:
        created = generate_seats(
            section,
            "A",
            "D",
            10,
        )
        total_created += created

    messages.success(
        request,
        f"{total_created} seats generated successfully.",
    )


class SeatInline(admin.TabularInline):
    model = Seat
    extra = 1
    fields = (
        "row",
        "seat_number",
        "is_active",
    )


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "venue",
        "display_order",
        "seat_count",
        "created_at",
    )

    search_fields = (
        "name",
        "venue__name",
        "venue__city",
    )

    list_filter = (
        "venue",
    )

    ordering = (
        "venue",
        "display_order",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        SeatInline,
    ]

    actions = [
        generate_sample_seats,
    ]

    @admin.display(description="Seats")
    def seat_count(self, obj):
        return obj.seats.count()


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
        "section__venue__name",
        "row",
    )

    list_filter = (
        "section__venue",
        "section",
        "is_active",
    )

    ordering = (
        "section",
        "row",
        "seat_number",
    )

    list_select_related = (
        "section",
        "section__venue",
    )
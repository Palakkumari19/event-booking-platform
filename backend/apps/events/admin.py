from django.contrib import admin

from .models import Event, EventSection


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "organizer",
        "venue",
        "start_time",
        "status",
    )

    search_fields = (
        "title",
        "organizer__email",
        "venue__name",
    )

    list_filter = (
        "status",
        "venue",
    )

    ordering = (
        "start_time",
    )


@admin.register(EventSection)
class EventSectionAdmin(admin.ModelAdmin):

    list_display = (
        "event",
        "section",
        "price",
    )

    search_fields = (
        "event__title",
        "section__name",
    )

    list_filter = (
        "event",
    )

    ordering = (
        "event",
        "section",
    )
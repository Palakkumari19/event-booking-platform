from django.contrib import admin

from .models import Event


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
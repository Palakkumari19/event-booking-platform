from django.contrib import admin, messages
from django.utils import timezone

from .models import Event, EventSection


class EventSectionInline(admin.TabularInline):
    model = EventSection
    extra = 1
    fields = (
        "section",
        "price",
    )


@admin.action(description="Publish selected events")
def publish_events(modeladmin, request, queryset):
    published_count = 0
    skipped_count = 0

    for event in queryset:
        if event.status != Event.Status.DRAFT:
            skipped_count += 1
            continue

        event.status = Event.Status.PUBLISHED
        event.save(update_fields=["status", "updated_at"])
        published_count += 1

    if published_count:
        messages.success(
            request,
            f"{published_count} event(s) published successfully.",
        )

    if skipped_count:
        messages.warning(
            request,
            f"{skipped_count} event(s) were skipped because "
            "they are not in DRAFT status.",
        )


@admin.action(description="Cancel selected events")
def cancel_events(modeladmin, request, queryset):
    cancelled_count = 0
    skipped_count = 0

    for event in queryset:

        if event.status not in (
            Event.Status.DRAFT,
            Event.Status.PUBLISHED,
        ):
            skipped_count += 1
            continue

        has_active_bookings = event.bookings.filter(
            status__in=[
                "PENDING",
                "CONFIRMED",
            ]
        ).exists()

        if has_active_bookings:
            skipped_count += 1
            continue

        event.status = Event.Status.CANCELLED
        event.save(update_fields=["status", "updated_at"])
        cancelled_count += 1

    if cancelled_count:
        messages.success(
            request,
            f"{cancelled_count} event(s) cancelled successfully.",
        )

    if skipped_count:
        messages.warning(
            request,
            f"{skipped_count} event(s) were skipped. "
            "Only DRAFT/PUBLISHED events without active bookings "
            "can be cancelled.",
        )


@admin.action(description="Mark selected events as completed")
def complete_events(modeladmin, request, queryset):
    completed_count = 0
    skipped_count = 0

    now = timezone.now()

    for event in queryset:

        if event.status != Event.Status.PUBLISHED:
            skipped_count += 1
            continue

        if event.end_time > now:
            skipped_count += 1
            continue

        event.status = Event.Status.COMPLETED
        event.save(update_fields=["status", "updated_at"])
        completed_count += 1

    if completed_count:
        messages.success(
            request,
            f"{completed_count} event(s) marked as completed.",
        )

    if skipped_count:
        messages.warning(
            request,
            f"{skipped_count} event(s) were skipped. "
            "Only published events whose end time has passed "
            "can be completed.",
        )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "organizer",
        "venue",
        "start_time",
        "booking_start",
        "booking_end",
        "status",
    )

    search_fields = (
        "title",
        "description",
        "organizer__email",
        "venue__name",
    )

    list_filter = (
        "status",
        "venue",
        "organizer",
    )

    ordering = (
        "start_time",
    )

    list_select_related = (
        "organizer",
        "venue",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Event Information",
            {
                "fields": (
                    "title",
                    "description",
                    "organizer",
                    "venue",
                )
            },
        ),
        (
            "Event Schedule",
            {
                "fields": (
                    "start_time",
                    "end_time",
                    "booking_start",
                    "booking_end",
                )
            },
        ),
        (
            "Event Status",
            {
                "fields": (
                    "status",
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
        EventSectionInline,
    ]

    actions = [
        publish_events,
        cancel_events,
        complete_events,
    ]


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
        "section",
    )

    ordering = (
        "event",
        "section",
    )

    list_select_related = (
        "event",
        "section",
    )
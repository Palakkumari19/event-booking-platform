from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/", include("apps.accounts.urls")),
    path("api/events/", include("apps.events.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
    path("api/tickets/", include("apps.tickets.urls")),
    path("api/payments/", include("apps.payments.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
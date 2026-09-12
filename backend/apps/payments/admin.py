from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "booking",
        "amount",
        "status",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_refund_id",
        "created_at",
    )

    search_fields = (
        "booking__user__email",
        "booking__event__title",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_refund_id",
    )

    list_filter = (
        "status",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    list_select_related = (
        "booking",
        "booking__user",
        "booking__event",
    )

    readonly_fields = (
        "booking",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "razorpay_refund_id",
        "amount",
        "status",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Payment Information",
            {
                "fields": (
                    "booking",
                    "amount",
                    "status",
                )
            },
        ),
        (
            "Razorpay Details",
            {
                "fields": (
                    "razorpay_order_id",
                    "razorpay_payment_id",
                    "razorpay_refund_id",
                    "razorpay_signature",
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
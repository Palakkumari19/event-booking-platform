from django.conf import settings

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    CreateOrderSerializer,
    VerifyPaymentSerializer,
)

from .services import PaymentService


class CreateOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = CreateOrderSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        result = PaymentService.create_payment_link(
            request.user,
            serializer.validated_data["booking_id"],
        )

        return Response(
        {
            "payment_link": result["payment_link"]["short_url"],
            "amount": result["payment_link"]["amount"],
            "currency": result["payment_link"]["currency"],
        }
    )


class VerifyPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = VerifyPaymentSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        payment = PaymentService.verify_payment(
            serializer.validated_data
        )

        return Response(
            {
                "message": "Payment verified successfully.",
                "status": payment.status,
            }
        )

class CheckPaymentStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        booking_id = request.data.get(
            "booking_id"
        )

        result = (
            PaymentService.check_payment_status(
                request.user,
                booking_id,
            )
        )

        return Response(result)
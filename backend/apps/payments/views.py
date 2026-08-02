from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.conf import settings

from .serializers import CreateOrderSerializer
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

        result = PaymentService.create_order(
            request.user,
            serializer.validated_data["booking_id"],
        )

        return Response(
            {
                "order_id": result["order"]["id"],
                "amount": result["order"]["amount"],
                "currency": result["order"]["currency"],
                "key": settings.RAZORPAY_KEY_ID,
                "payment_id": result["payment"].id,
            }
        )
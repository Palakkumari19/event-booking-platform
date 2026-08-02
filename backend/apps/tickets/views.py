from django.http import Http404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .selectors import get_ticket, get_user_tickets
from .serializers import (
    TicketDetailSerializer,
    TicketListSerializer,
)


class MyTicketsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        tickets = get_user_tickets(request.user)

        serializer = TicketListSerializer(
            tickets,
            many=True,
        )

        return Response(serializer.data)


class TicketDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):

        try:
            ticket = get_ticket(
                ticket_id,
                request.user,
            )

        except Exception:
            raise Http404

        serializer = TicketDetailSerializer(
            ticket,
            context={
                "request": request,
            },
        )

        return Response(serializer.data)
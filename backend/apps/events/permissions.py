from rest_framework.permissions import BasePermission


class IsOrganizer(BasePermission):
    message = "Only organizers can access this feature."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "ORGANIZER"
        )
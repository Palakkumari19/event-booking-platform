from django.db import models
from django.contrib.auth.models import AbstractUser

from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        ATTENDEE = "ATTENDEE", "Attendee"
        ORGANIZER = "ORGANIZER", "Organizer"

    username = None

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATTENDEE,
    )

    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self):
        return self.email
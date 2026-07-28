from django.core.exceptions import ValidationError
from django.db import models


class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Venue"
        verbose_name_plural = "Venues"

        constraints = [
            models.UniqueConstraint(
                fields=["name", "city"],
                name="unique_venue_name_city",
            )
        ]

    def clean(self):
        self.name = self.name.strip()
        self.city = self.city.strip()
        self.state = self.state.strip()
        self.country = self.country.strip()

        if not self.name:
            raise ValidationError({"name": "Venue name cannot be empty."})

        if not self.city:
            raise ValidationError({"city": "City cannot be empty."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Section(models.Model):
    venue = models.ForeignKey(
        Venue,
        on_delete=models.CASCADE,
        related_name="sections",
    )

    name = models.CharField(max_length=100)

    display_order = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order"]

        constraints = [
            models.UniqueConstraint(
                fields=["venue", "name"],
                name="unique_section_per_venue",
            )
        ]

    def clean(self):
        self.name = self.name.strip()

        if not self.name:
            raise ValidationError({"name": "Section name cannot be empty."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.venue.name} - {self.name}"

class Seat(models.Model):
    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="seats",
    )

    row = models.CharField(max_length=10)

    seat_number = models.PositiveIntegerField()

    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["row", "seat_number"]

        constraints = [
            models.UniqueConstraint(
                fields=["section", "row", "seat_number"],
                name="unique_seat_per_section",
            )
        ]

    def clean(self):
        self.row = self.row.strip().upper()

        if not self.row:
            raise ValidationError({"row": "Row cannot be empty."})

        if self.seat_number <= 0:
            raise ValidationError(
                {"seat_number": "Seat number must be greater than zero."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.section.name} - {self.row}{self.seat_number}"
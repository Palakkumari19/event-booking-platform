from .models import Seat


def generate_seats(section, start_row, end_row, seats_per_row):
    seats = []

    for row in range(ord(start_row.upper()), ord(end_row.upper()) + 1):
        row_letter = chr(row)

        for number in range(1, seats_per_row + 1):
            seats.append(
                Seat(
                    section=section,
                    row=row_letter,
                    seat_number=number,
                )
            )

    Seat.objects.bulk_create(seats)
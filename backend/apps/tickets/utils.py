import json
from io import BytesIO

import qrcode
from django.core.files.base import ContentFile


def generate_qr(ticket):

    qr_data = {
        "ticket_number": ticket.ticket_number,
        "ticket_id": ticket.id,
        "booking_id": ticket.booking.id,
        "event": ticket.booking.event.title,
        "seat": (
            f"{ticket.booking.seat.section.name}-"
            f"{ticket.booking.seat.row}"
            f"{ticket.booking.seat.seat_number}"
        ),
    }

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )

    qr.add_data(json.dumps(qr_data))

    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    buffer = BytesIO()

    image.save(buffer, format="PNG")

    filename = f"{ticket.ticket_number}.png"

    ticket.qr_code.save(
        filename,
        ContentFile(buffer.getvalue()),
        save=False,
    )

    buffer.close()
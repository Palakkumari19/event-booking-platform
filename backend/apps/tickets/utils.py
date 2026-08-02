import qrcode

from io import BytesIO

from django.core.files import File


def generate_qr(ticket):

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
    )

    qr.add_data(ticket.ticket_number)
    qr.make(fit=True)

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    stream = BytesIO()

    image.save(stream, format="PNG")

    ticket.qr_code.save(
        f"{ticket.ticket_number}.png",
        File(stream),
        save=False,
    )

    stream.close()
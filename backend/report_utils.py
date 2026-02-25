from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import Table, TableStyle
import os
from datetime import datetime


def generate_ticket_pdf(event_name, user_email, reference_number):
    filename = f"{reference_number}.pdf"
    filepath = os.path.join("tickets", filename)

    os.makedirs("tickets", exist_ok=True)

    doc = SimpleDocTemplate(filepath, pagesize=A4)
    elements = []

    styles = getSampleStyleSheet()

    elements.append(Paragraph("<b>Ticket Booking Confirmation</b>", styles["Title"]))
    elements.append(Spacer(1, 0.5 * inch))

    data = [
        ["Event Name", event_name],
        ["Booked User", user_email],
        ["Reference Number", reference_number],
        ["Booking Date", datetime.now().strftime("%Y-%m-%d %H:%M:%S")]
    ]

    table = Table(data, colWidths=[2.5 * inch, 3 * inch])

    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 1, colors.grey),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
            ]
        )
    )

    elements.append(table)

    doc.build(elements)

    return filepath
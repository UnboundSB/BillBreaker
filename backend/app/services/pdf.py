import io
from app.schemas.bill import SplitResult
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

def generate_split_pdf(result: SplitResult) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    styles = getSampleStyleSheet()
    elements = []
    
    # Title
    elements.append(Paragraph("BillBreaker - Split Summary", styles['Title']))
    elements.append(Spacer(1, 12))
    
    # Overview
    elements.append(Paragraph("Total Overview", styles['Heading2']))
    overview_data = [
        ["Calculated Total:", f"₹{result.calculated_total:.2f}"],
        ["Printed Total:", f"₹{result.printed_total:.2f}"],
        ["Mismatch (Tip/Rounding):", f"₹{result.mismatch_amount:.2f}"]
    ]
    t = Table(overview_data, colWidths=[200, 100])
    t.setStyle(TableStyle([
        ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
        ('ALIGN', (1,0), (1,-1), 'RIGHT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 24))
    
    # Individual Breakdowns
    elements.append(Paragraph("Individual Breakdowns", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    for person in result.people_breakdowns:
        elements.append(Paragraph(f"{person.name}", styles['Heading3']))
        
        person_data = [
            ["Items Total:", f"₹{person.items_total:.2f}"],
            ["Tax:", f"₹{person.tax:.2f}"],
            ["Service Charge:", f"₹{person.service_charge:.2f}"],
            ["Discount:", f"₹{person.discount:.2f}"],
            ["Grand Total:", f"₹{person.total:.2f}"]
        ]
        
        pt = Table(person_data, colWidths=[200, 100])
        pt.setStyle(TableStyle([
            ('TEXTCOLOR', (0,0), (-1,-1), colors.black),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black),
            ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(pt)
        elements.append(Spacer(1, 18))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return pdf_bytes

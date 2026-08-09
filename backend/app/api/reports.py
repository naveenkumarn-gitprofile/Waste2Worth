from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.schemas import ReportResponse, ReportListResponse
from app.models.report import Report
from app.models.user import User
from app.api.auth import get_current_user
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import tempfile
import os

router = APIRouter()


@router.get("/", response_model=List[ReportListResponse])
def get_reports(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all reports for the logged-in user with optional search/filter"""
    query = db.query(Report).filter(Report.user_id == current_user.id)
    
    if search:
        query = query.filter(
            (Report.sample_name.ilike(f"%{search}%")) |
            (Report.source_type.ilike(f"%{search}%"))
        )
    
    reports = query.order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific report by ID"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate and download PDF report"""
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Create temporary file for PDF
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf_path = tmp.name
    
    try:
        # Generate PDF using ReportLab
        generate_pdf_report(report, pdf_path)
        
        # Return PDF file
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"nutriwaste_report_{report.sample_name}_{report.created_at.strftime('%Y%m%d')}.pdf"
        )
    except Exception as e:
        # Clean up temp file if generation failed
        if os.path.exists(pdf_path):
            os.unlink(pdf_path)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


def generate_pdf_report(report: Report, pdf_path: str):
    """Generate PDF report using ReportLab"""
    
    # Extract composition data
    composition = report.composition or {}
    recommendations = report.recommended_products or []
    
    # Create PDF document
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1B4332'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1B4332'),
        spaceAfter=12,
        spaceBefore=20
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    
    # Build content
    story = []
    
    # Header
    story.append(Paragraph("NutriWasteAI Analysis Report", title_style))
    story.append(Paragraph("Food Waste Valorization & Nutritional Assessment", normal_style))
    story.append(Spacer(1, 0.3 * inch))
    
    # Sample Information
    story.append(Paragraph("Sample Information", heading_style))
    
    info_data = [
        ['Sample Name:', report.sample_name],
        ['Source Type:', report.source_type],
        ['Input Method:', report.input_method.title()],
        ['Analysis Date:', report.created_at.strftime('%B %d, %Y')]
    ]
    
    info_table = Table(info_data, colWidths=[2 * inch, 3 * inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F8FAF6')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 0.3 * inch))
    
    # Nutritional Composition
    story.append(Paragraph("Nutritional Composition (per 100g)", heading_style))
    
    nutrient_data = [
        ['Nutrient', 'Value'],
        ['Protein', f"{composition.get('protein_g_per_100g', 'N/A')} g"],
        ['Fat', f"{composition.get('fat_g_per_100g', 'N/A')} g"],
        ['Fibre', f"{composition.get('fibre_g_per_100g', 'N/A')} g"],
        ['Carbohydrate', f"{composition.get('carbohydrate_g_per_100g', 'N/A')} g"],
        ['Ash', f"{composition.get('ash_g_per_100g', 'N/A')} g"],
        ['Moisture', f"{composition.get('moisture_g_per_100g', 'N/A')} g"],
        ['Energy', f"{composition.get('energy_kcal_per_100g', 'N/A')} kcal"]
    ]
    
    nutrient_table = Table(nutrient_data, colWidths=[2.5 * inch, 2.5 * inch])
    nutrient_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1B4332')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(nutrient_table)
    story.append(Spacer(1, 0.3 * inch))
    
    # Recommendations
    story.append(Paragraph("Recommended Value-Added Products", heading_style))
    
    for rec in recommendations:
        product = rec.get('product', 'Unnamed Product')
        rationale = rec.get('rationale', 'No rationale provided.')
        
        story.append(Paragraph(f"<b>{product}</b>", normal_style))
        story.append(Paragraph(rationale, normal_style))
        story.append(Spacer(1, 0.1 * inch))
    
    # Source Reference
    if composition.get('source_reference'):
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph(f"<i>Source Reference: {composition['source_reference']}</i>", normal_style))
    
    # Footer
    story.append(PageBreak())
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("Generated by NutriWasteAI", normal_style))
    story.append(Paragraph("Contributing to UN Sustainable Development Goals 2, 9, and 12", normal_style))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(f"Report generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", normal_style))
    
    # Build PDF
    doc.build(story)

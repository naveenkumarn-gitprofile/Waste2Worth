from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.schemas import ReportResponse, ReportListResponse
from app.models.report import Report
from app.models.user import User
from app.api.auth import get_current_user
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import tempfile
import os


router = APIRouter()


@router.get("/count")
def get_reports_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the total count of reports for the logged-in user"""
    count = db.query(Report).filter(Report.user_id == current_user.id).count()
    return {"count": count}


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
    """Generate PDF report using ReportLab with simple structure and better visibility"""
    
    # Extract complete data from report
    composition = report.composition or {}
    recommendations = report.recommended_products or []
    
    # Extract ML prediction data
    top_confidence_pct = composition.get('top_confidence_pct', 0.0)
    rule_applied = composition.get('rule_applied', 'No rule applied')
    
    # Extract input parameters from individual columns first (new reports), then fallback to composition
    input_params = {
        'fruit_type': report.fruit_type or composition.get('fruit_type', 'Unknown'),
        'moisture': report.moisture or composition.get('moisture', 0.0),
        'ash': report.ash or composition.get('ash', 0.0),
        'protein': report.protein or composition.get('protein', 0.0),
        'fat': report.fat or composition.get('fat', 0.0),
        'crude_fiber': report.crude_fiber or composition.get('crude_fiber', 0.0),
        'carbohydrate': report.carbohydrate or composition.get('carbohydrate', 0.0),
        'total_phenolics': report.total_phenolics or composition.get('total_phenolics', 0.0),
        'total_flavonoids': report.total_flavonoids or composition.get('total_flavonoids', 0.0),
        'dpph': report.dpph or composition.get('dpph', 0.0),
    }
    
    # Create PDF document with A4 size and proper margins
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=15*mm,
        bottomMargin=15*mm
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles for better visibility
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.black,
        spaceAfter=5*mm,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.darkgrey,
        spaceAfter=8*mm,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.black,
        spaceAfter=4*mm,
        spaceBefore=6*mm,
        fontName='Helvetica-Bold',
        leading=14
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.black,
        fontName='Helvetica',
        leading=12
    )
    
    value_style = ParagraphStyle(
        'CustomValue',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.blue,
        fontName='Helvetica-Bold',
        leading=12
    )
    
    confidence_style = ParagraphStyle(
        'CustomConfidence',
        parent=styles['Normal'],
        fontSize=16,
        textColor=colors.red,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=18
    )
    
    # Build content
    story = []
    
    # Header
    story.append(Paragraph("NutriWasteAI - Value Addition Analysis Report", title_style))
    story.append(Paragraph("AI-Powered Food Waste Valorization & Product Recommendation", subtitle_style))
    
    # Meta information
    meta_text = f"Sample ID: NW-{report.id:06d} | Date: {report.created_at.strftime('%B %d, %Y %H:%M')}"
    story.append(Paragraph(meta_text, normal_style))
    story.append(Spacer(1, 8*mm))
    
    # Sample Information
    story.append(Paragraph("Sample Information", heading_style))
    story.append(Paragraph(f"<b>Sample Name:</b> {report.sample_name}", normal_style))
    story.append(Paragraph(f"<b>Source Type:</b> {report.source_type}", normal_style))
    story.append(Paragraph(f"<b>Input Method:</b> {report.input_method}", normal_style))
    story.append(Spacer(1, 6*mm))
    
    # Laboratory Input Parameters - Simple list format
    story.append(Paragraph("Laboratory Input Parameters", heading_style))
    story.append(Paragraph(f"<b>Fruit Peel Type:</b> {input_params['fruit_type']}", normal_style))
    story.append(Paragraph(f"<b>Moisture:</b> {input_params['moisture']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Ash:</b> {input_params['ash']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Protein:</b> {input_params['protein']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Fat:</b> {input_params['fat']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Crude Fiber:</b> {input_params['crude_fiber']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Carbohydrate:</b> {input_params['carbohydrate']:.2f}%", normal_style))
    story.append(Paragraph(f"<b>Total Phenolics:</b> {input_params['total_phenolics']:.2f} mg GAE/g", normal_style))
    story.append(Paragraph(f"<b>Total Flavonoids:</b> {input_params['total_flavonoids']:.2f} mg QE/g", normal_style))
    story.append(Paragraph(f"<b>DPPH Inhibition:</b> {input_params['dpph']:.2f}%", normal_style))
    story.append(Spacer(1, 6*mm))
    
    # Model Prediction Overview
    story.append(Paragraph("Model Prediction Overview", heading_style))
    story.append(Paragraph(f"<b>Top Confidence Score:</b> {top_confidence_pct:.2f}%", confidence_style))
    story.append(Paragraph(f"<b>Applied Rule:</b> {rule_applied}", normal_style))
    story.append(Spacer(1, 6*mm))
    
    # Recommended Value-Added Products - Simple numbered list
    story.append(Paragraph("Recommended Value-Added Products", heading_style))
    for i, rec in enumerate(recommendations, 1):
        story.append(Paragraph(f"<b>{i}. {rec['product']}</b>", normal_style))
        story.append(Paragraph(f"   Confidence: {rec['confidence_pct']}%", value_style))
        story.append(Paragraph(f"   Application: High-value application based on biochemical profile", normal_style))
        story.append(Spacer(1, 3*mm))
    
    story.append(Spacer(1, 8*mm))
    
    # Footer
    footer_text = "Generated by NutriWasteAI Intelligence Engine • Confidential Laboratory Report"
    story.append(Paragraph(footer_text, normal_style))
    
    # Build PDF
    doc.build(story)

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.schemas import ManualAnalysisInput, ImageAnalysisInput, AnalysisResponse
from app.services.ml_predictor import predict_and_recommend
from app.models.report import Report
from app.models.user import User
import os
import uuid
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
UPLOAD_DIR = "uploads"


@router.post("/manual", response_model=AnalysisResponse)
def manual_analysis(
    input_data: ManualAnalysisInput,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Run analysis with manual entry - works for both trial and logged-in users"""
    try:
        # Get current user if authenticated
        current_user = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            try:
                from app.core.security import decode_access_token
                payload = decode_access_token(token)
                if payload:
                    email = payload.get("sub")
                    if email:
                        current_user = db.query(User).filter(User.email == email).first()
            except Exception:
                pass
        
        logger.info(f"Manual analysis attempt for sample: {input_data.sample_name}, user: {current_user.email if current_user else 'trial'}")
        
        # Call mock ML prediction
        prediction = predict_and_recommend(input_data.dict())
        
        # Only save to DB if user is authenticated
        report_id = None
        if current_user:
            report = Report(
                user_id=current_user.id,
                sample_name=input_data.sample_name,
                source_type=input_data.source_type,
                input_method="manual",
                protein=prediction["composition"]["protein_g_per_100g"],
                fat=prediction["composition"]["fat_g_per_100g"],
                fibre=prediction["composition"]["fibre_g_per_100g"],
                carbohydrate=prediction["composition"]["carbohydrate_g_per_100g"],
                ash=prediction["composition"]["ash_g_per_100g"],
                moisture=prediction["composition"]["moisture_g_per_100g"],
                energy=prediction["composition"]["energy_kcal_per_100g"],
                composition=prediction["composition"],
                recommended_products=prediction["recommendations"],
                source_reference=prediction["composition"]["source_reference"]
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            report_id = report.id
            logger.info(f"Analysis saved to DB with report ID: {report_id}")
        else:
            logger.info("Trial mode analysis - not saving to DB")
        
        return AnalysisResponse(
            composition=prediction["composition"],
            recommendations=prediction["recommendations"],
            report_id=report_id
        )
    except Exception as e:
        logger.error(f"Manual analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/image", response_model=AnalysisResponse)
async def image_analysis(
    sample_name: str = Form(...),
    source_type: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    """Run analysis with image upload - works for both trial and logged-in users"""
    try:
        # Get current user if authenticated
        current_user = None
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            try:
                from app.core.security import decode_access_token
                payload = decode_access_token(token)
                if payload:
                    email = payload.get("sub")
                    if email:
                        current_user = db.query(User).filter(User.email == email).first()
            except Exception:
                pass
        
        logger.info(f"Image analysis attempt for sample: {sample_name}, user: {current_user.email if current_user else 'trial'}")
        
        # Save image if provided
        image_path = None
        if image:
            # Create unique filename
            file_extension = image.filename.split(".")[-1] if image.filename else "jpg"
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            image_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Ensure upload directory exists
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            # Save file
            with open(image_path, "wb") as buffer:
                content = await image.read()
                buffer.write(content)
        
        # Call mock ML prediction (image not actually analyzed yet)
        input_data = {"sample_name": sample_name, "source_type": source_type}
        prediction = predict_and_recommend(input_data)
        
        # Only save to DB if user is authenticated
        report_id = None
        if current_user:
            report = Report(
                user_id=current_user.id,
                sample_name=sample_name,
                source_type=source_type,
                input_method="image",
                image_path=image_path,
                protein=prediction["composition"]["protein_g_per_100g"],
                fat=prediction["composition"]["fat_g_per_100g"],
                fibre=prediction["composition"]["fibre_g_per_100g"],
                carbohydrate=prediction["composition"]["carbohydrate_g_per_100g"],
                ash=prediction["composition"]["ash_g_per_100g"],
                moisture=prediction["composition"]["moisture_g_per_100g"],
                energy=prediction["composition"]["energy_kcal_per_100g"],
                composition=prediction["composition"],
                recommended_products=prediction["recommendations"],
                source_reference=prediction["composition"]["source_reference"]
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            report_id = report.id
            logger.info(f"Image analysis saved to DB with report ID: {report_id}")
        else:
            logger.info("Trial mode image analysis - not saving to DB")
        
        logger.info(f"Image analysis successful for sample: {sample_name}")
        return AnalysisResponse(
            composition=prediction["composition"],
            recommendations=prediction["recommendations"],
            report_id=report_id
        )
    except Exception as e:
        logger.error(f"Image analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image analysis failed: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.schemas import ManualAnalysisInput, AnalysisResponse
from app.services.ml_predictor import predict_and_recommend
from app.models.report import Report
from app.models.user import User
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()


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
        
        # Call XGBoost ML prediction with new 9-feature model
        prediction = predict_and_recommend(input_data.dict())
        
        # Only save to DB if user is authenticated
        report_id = None
        if current_user:
            # Merge input parameters with prediction for complete data storage
            complete_composition = {
                **input_data.dict(),  # Include all input parameters
                **prediction  # Include prediction results
            }
            
            report = Report(
                user_id=current_user.id,
                sample_name=input_data.sample_name,
                source_type=input_data.source_type,
                input_method="manual",
                composition=complete_composition,
                recommended_products=prediction["recommendations"],
                # Store individual parameters for easier display
                moisture=input_data.moisture,
                ash=input_data.ash,
                protein=input_data.protein,
                fat=input_data.fat,
                crude_fiber=input_data.crude_fiber,
                carbohydrate=input_data.carbohydrate,
                total_phenolics=input_data.total_phenolics,
                total_flavonoids=input_data.total_flavonoids,
                dpph=input_data.dpph,
                fruit_type=input_data.fruit_type
            )
            db.add(report)
            db.commit()
            db.refresh(report)
            report_id = report.id
            logger.info(f"Analysis saved to DB with report ID: {report_id}")
        else:
            logger.info("Trial mode analysis - not saving to DB")
        
        return AnalysisResponse(
            top_confidence_pct=prediction["top_confidence_pct"],
            rule_applied=prediction["rule_applied"],
            recommendations=prediction["recommendations"],
            report_id=report_id
        )
    except Exception as e:
        logger.error(f"Manual analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

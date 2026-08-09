from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sample_name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    input_method = Column(String, nullable=False)  # "manual" or "image"
    image_path = Column(String, nullable=True)
    
    # Nutrient values
    protein = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fibre = Column(Float, nullable=True)
    carbohydrate = Column(Float, nullable=True)
    ash = Column(Float, nullable=True)
    moisture = Column(Float, nullable=True)
    energy = Column(Float, nullable=True)
    
    # Additional nutritional data
    ph = Column(Float, nullable=True)
    polyphenol = Column(Float, nullable=True)
    antioxidant = Column(Float, nullable=True)
    texture = Column(String, nullable=True)
    color = Column(String, nullable=True)
    
    # JSON fields for composition and recommendations
    composition = Column(JSON, nullable=True)
    recommended_products = Column(JSON, nullable=True)
    source_reference = Column(String, nullable=True)
    
    # Report generation
    report_path = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", backref="reports")

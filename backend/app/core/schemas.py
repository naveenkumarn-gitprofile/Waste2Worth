from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Analysis schemas
class ManualAnalysisInput(BaseModel):
    sample_name: str
    source_type: str  # fruit peel, vegetable residue, whey, oilseed cake, other
    fruit_type: str  # For UI selection only - not sent to ML model
    moisture: float  # Moisture content percentage
    ash: float  # Ash content percentage
    protein: float  # Protein content percentage
    fat: float  # Fat content percentage
    crude_fiber: float  # Crude fiber percentage
    carbohydrate: float  # Carbohydrate percentage
    total_phenolics: float  # Total phenolics (mg GAE/g)
    total_flavonoids: float  # Total flavonoids (mg QE/g)
    dpph: float  # DPPH inhibition percentage

    @field_validator('moisture', 'ash', 'protein', 'fat', 'crude_fiber', 'carbohydrate', 'total_phenolics', 'total_flavonoids', 'dpph')
    @classmethod
    def validate_numeric_fields(cls, v):
        if v < 0:
            raise ValueError('Value must be non-negative')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "sample_name": "Banana Peel Sample",
                "source_type": "fruit peel",
                "fruit_type": "Banana",
                "moisture": 85.5,
                "ash": 8.2,
                "protein": 6.1,
                "fat": 3.8,
                "crude_fiber": 12.4,
                "carbohydrate": 58.3,
                "total_phenolics": 45.2,
                "total_flavonoids": 32.1,
                "dpph": 78.5
            }
        }


class ImageAnalysisInput(BaseModel):
    sample_name: str
    source_type: str


class Composition(BaseModel):
    protein_g_per_100g: float
    fat_g_per_100g: float
    fibre_g_per_100g: float
    carbohydrate_g_per_100g: float
    ash_g_per_100g: float
    moisture_g_per_100g: float
    energy_kcal_per_100g: float
    source_reference: str


class Recommendation(BaseModel):
    rank: int
    product: str
    confidence_pct: float


class AnalysisResponse(BaseModel):
    top_confidence_pct: float
    rule_applied: str
    recommendations: List[Recommendation]
    report_id: Optional[int] = None  # Only populated if saved to DB


# Report schemas
class ReportResponse(BaseModel):
    id: int
    sample_name: str
    source_type: str
    input_method: str
    image_path: Optional[str] = None
    # New ML model parameters
    moisture: Optional[float] = None
    ash: Optional[float] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    crude_fiber: Optional[float] = None
    carbohydrate: Optional[float] = None
    total_phenolics: Optional[float] = None
    total_flavonoids: Optional[float] = None
    dpph: Optional[float] = None
    fruit_type: Optional[str] = None
    # Legacy fields for backward compatibility
    fibre: Optional[float] = None
    energy: Optional[float] = None
    composition: Optional[dict] = None
    recommended_products: Optional[List[dict]] = None
    source_reference: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    id: int
    sample_name: str
    source_type: str
    input_method: str
    created_at: datetime

    class Config:
        from_attributes = True

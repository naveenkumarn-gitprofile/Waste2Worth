from pydantic import BaseModel, EmailStr
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
    protein: Optional[float] = None
    fat: Optional[float] = None
    fibre: Optional[float] = None
    carbohydrate: Optional[float] = None
    ash: Optional[float] = None
    moisture: Optional[float] = None


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
    product: str
    rationale: str


class AnalysisResponse(BaseModel):
    composition: Composition
    recommendations: List[Recommendation]
    report_id: Optional[int] = None  # Only populated if saved to DB


# Report schemas
class ReportResponse(BaseModel):
    id: int
    sample_name: str
    source_type: str
    input_method: str
    image_path: Optional[str] = None
    protein: Optional[float] = None
    fat: Optional[float] = None
    fibre: Optional[float] = None
    carbohydrate: Optional[float] = None
    ash: Optional[float] = None
    moisture: Optional[float] = None
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

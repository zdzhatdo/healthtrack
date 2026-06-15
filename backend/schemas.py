from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, List

# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Symptom schemas
class SymptomCreate(BaseModel):
    symptom: str
    severity: int

class SymptomResponse(BaseModel):
    id: int
    symptom: str
    severity: int

    class Config:
        from_attributes = True

# Health log schemas
class HealthLogCreate(BaseModel):
    date: date
    notes: Optional[str] = None
    symptoms: List[SymptomCreate]

class HealthLogResponse(BaseModel):
    id: int
    date: date
    notes: Optional[str]
    created_at: datetime
    symptoms: List[SymptomResponse]

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
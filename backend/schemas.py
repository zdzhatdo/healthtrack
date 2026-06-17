from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import date, datetime
from typing import Optional, List

# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

class Token(BaseModel):
    access_token: str
    token_type: str

# Symptom schemas
class SymptomCreate(BaseModel):
    symptom: str = Field(min_length=1, max_length=100)
    severity: int = Field(ge=1, le=10)

    @field_validator('symptom')
    @classmethod
    def symptom_not_blank(cls, v):
        if not v.strip():
            raise ValueError('Symptom cannot be blank')
        return v.strip()

class SymptomResponse(BaseModel):
    id: int
    symptom: str
    severity: int

    class Config:
        from_attributes = True

# Health log schemas
class HealthLogCreate(BaseModel):
    date: date
    notes: Optional[str] = Field(default=None, max_length=1000)
    symptoms: List[SymptomCreate] = Field(min_length=1, max_length=20)

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
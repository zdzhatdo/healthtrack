# defines what data looks like coming in and out of the API

from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

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

# Health log schemas
class HealthLogCreate(BaseModel):
    date: date
    symptom: str
    severity: int
    notes: Optional[str] = None

class HealthLogResponse(BaseModel):
    id: int
    date: date
    symptom: str
    severity: int
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
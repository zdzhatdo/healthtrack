from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    logs = relationship("HealthLog", back_populates="owner")

class HealthLog(Base):
    __tablename__ = "health_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="logs")
    symptoms = relationship("LogSymptom", back_populates="log", cascade="all, delete-orphan")

# new class to support logging additional symptoms
class LogSymptom(Base):
    __tablename__ = "log_symptoms"

    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("health_logs.id"), nullable=False)
    symptom = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)

    log = relationship("HealthLog", back_populates="symptoms")
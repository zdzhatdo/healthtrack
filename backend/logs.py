from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db
from auth import get_current_user
import models
import schemas
from typing import Optional

# note: summary route uses SQL aggregate functions (func.avg, func.count) to calculate stats directly in the database rather than in python for efficiency

router = APIRouter(prefix="/logs", tags=["logs"])

security = HTTPBearer()

def get_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return get_current_user(credentials.credentials, db)

@router.post("/", response_model=schemas.HealthLogResponse)
def create_log(log: schemas.HealthLogCreate, current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    new_log = models.HealthLog(
        user_id=current_user.id,
        date=log.date,
        symptom=log.symptom,
        severity=log.severity,
        notes=log.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=list[schemas.HealthLogResponse])
def get_logs(current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    return db.query(models.HealthLog).filter(models.HealthLog.user_id == current_user.id).all()

@router.put("/{log_id}", response_model=schemas.HealthLogResponse)
def update_log(log_id: int, log: schemas.HealthLogCreate, current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    db_log = db.query(models.HealthLog).filter(models.HealthLog.id == log_id, models.HealthLog.user_id == current_user.id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    db_log.date = log.date
    db_log.symptom = log.symptom
    db_log.severity = log.severity
    db_log.notes = log.notes
    db.commit()
    db.refresh(db_log)
    return db_log

@router.delete("/{log_id}")
def delete_log(log_id: int, current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    db_log = db.query(models.HealthLog).filter(models.HealthLog.id == log_id, models.HealthLog.user_id == current_user.id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(db_log)
    db.commit()
    return {"message": "Log deleted"}

@router.get("/summary")
def get_summary(current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    logs = db.query(models.HealthLog).filter(models.HealthLog.user_id == current_user.id).all()
    if not logs:
        return {"message": "No logs yet"}
    avg_severity = db.query(func.avg(models.HealthLog.severity)).filter(models.HealthLog.user_id == current_user.id).scalar()
    most_common = db.query(models.HealthLog.symptom, func.count(models.HealthLog.symptom).label("count")).filter(models.HealthLog.user_id == current_user.id).group_by(models.HealthLog.symptom).order_by(func.count(models.HealthLog.symptom).desc()).first()
    return {
        "total_logs": len(logs),
        "average_severity": round(float(avg_severity), 2),
        "most_common_symptom": most_common[0] if most_common else None
    }
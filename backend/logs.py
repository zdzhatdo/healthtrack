from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
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
    # create the log entry
    new_log = models.HealthLog(
        user_id=current_user.id,
        date=log.date,
        notes=log.notes
    )
    db.add(new_log)
    db.flush()  # gets new_log.id without committing yet

    # attach each symptom to the log
    for s in log.symptoms:
        db.add(models.LogSymptom(
            log_id=new_log.id,
            symptom=s.symptom,
            severity=s.severity
        ))

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

    # update log fields
    db_log.date = log.date
    db_log.notes = log.notes

    # delete old symptoms and replace with new ones
    for s in db_log.symptoms:
        db.delete(s)
    db.flush()

    for s in log.symptoms:
        db.add(models.LogSymptom(
            log_id=db_log.id,
            symptom=s.symptom,
            severity=s.severity
        ))

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

    # calculate stats across all symptoms
    all_symptoms = [s for log in logs for s in log.symptoms]
    if not all_symptoms:
        return {"total_logs": len(logs), "average_severity": None, "most_common_symptom": None}

    avg_severity = round(sum(s.severity for s in all_symptoms) / len(all_symptoms), 2)

    symptom_counts = {}
    for s in all_symptoms:
        symptom_counts[s.symptom] = symptom_counts.get(s.symptom, 0) + 1
    most_common = max(symptom_counts, key=symptom_counts.get)

    return {
        "total_logs": len(logs),
        "average_severity": avg_severity,
        "most_common_symptom": most_common
    }
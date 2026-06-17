from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from auth import require_admin
import models

router = APIRouter(prefix="/admin", tags=["admin"])
security = HTTPBearer()

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return require_admin(credentials.credentials, db)

@router.get("/stats")
def get_admin_stats(admin: models.User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_logs = db.query(models.HealthLog).count()
    total_symptoms = db.query(models.LogSymptom).count()

    # most common symptoms across all users
    symptom_counts = (
        db.query(models.LogSymptom.symptom, func.count(models.LogSymptom.symptom).label("count"))
        .group_by(models.LogSymptom.symptom)
        .order_by(func.count(models.LogSymptom.symptom).desc())
        .limit(5)
        .all()
    )

    avg_severity = db.query(func.avg(models.LogSymptom.severity)).scalar()

    return {
        "total_users": total_users,
        "total_logs": total_logs,
        "total_symptoms_logged": total_symptoms,
        "average_severity_across_all_users": round(float(avg_severity), 2) if avg_severity else None,
        "top_symptoms": [{"symptom": s[0], "count": s[1]} for s in symptom_counts]
    }
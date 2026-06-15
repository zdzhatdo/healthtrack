from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/insights", tags=["insights"])
security = HTTPBearer()

def get_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    return get_current_user(credentials.credentials, db)

@router.get("/")
def get_insights(current_user: models.User = Depends(get_user_from_token), db: Session = Depends(get_db)):
    # fetch all logs for this user
    logs = db.query(models.HealthLog).filter(models.HealthLog.user_id == current_user.id).all()

    if not logs:
        return {"insights": ["No logs yet — start tracking your symptoms to get personalized insights!"]}

    # build a summary of the user's logs to send to Gemini
    log_summary = []
    for log in logs:
        for s in log.symptoms:
            log_summary.append(f"{log.date}: {s.symptom} (severity {s.severity}/10){', notes: ' + log.notes if log.notes else ''}")

    log_text = "\n".join(log_summary)

    prompt = f"""You are a helpful health tracking assistant. A user has been logging their symptoms.
Here are their recent health logs:

{log_text}

Based on these logs, provide exactly 4 short, personalized, actionable insights about their health patterns.
Each insight should be 1-2 sentences maximum.
Focus on patterns, trends, and practical observations.
Do not give medical diagnoses or medical advice.
Always remind them to consult a doctor for medical concerns.
Respond with exactly 4 insights, one per line, numbered 1-4.
Do not use markdown formatting or bullet points."""

    try:
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )
        raw = response.text.strip()
        lines = [line.strip() for line in raw.split('\n') if line.strip()]
        insights = [line.lstrip('1234567890. ') for line in lines if line][:4]
        return {"insights": insights}
    except Exception as e:
        print(f"Gemini error: {e}", flush=True)
        return {"insights": ["Unable to generate insights at this time. Please try again later."]}
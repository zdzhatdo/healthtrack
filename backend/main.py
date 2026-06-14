from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "HealthTrack API is running"}
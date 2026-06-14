from fastapi import FastAPI
from database import engine
import models

# tell SQLalchemy to create tables defined by models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "HealthTrack API is running"}
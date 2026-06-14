from fastapi import FastAPI
from database import engine
import models
import auth

# tell SQLalchemy to create tables defined by models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "HealthTrack API is running"}
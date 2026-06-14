from fastapi import FastAPI
from fastapi.security import HTTPBearer
from database import engine
import models
import auth
import logs

# tell SQLalchemy to create tables defined by models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthTrack API",
    description="Personal health tracking API",
    version="1.0.0",
)

security = HTTPBearer()

# routing
app.include_router(auth.router)
app.include_router(logs.router)

@app.get("/")
def root():
    return {"message": "HealthTrack API is running"}
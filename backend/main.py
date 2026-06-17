from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import engine
import models
import auth
import logs
import insights

limiter = Limiter(key_func=get_remote_address)

# tell SQLalchemy to create tables defined by models
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthTrack API",
    description="Personal health tracking API",
    version="1.0.0",
)

# adding middleware to fix CORS blocking
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "https://healthtrack-liard.vercel.app", "https://healthtrack-git-main-zdzhatdos-projects.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routing
app.include_router(auth.router)
app.include_router(logs.router)
app.include_router(insights.router)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/")
def root():
    return {"message": "HealthTrack API is running"}
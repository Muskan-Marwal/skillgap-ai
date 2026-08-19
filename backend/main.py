from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import init_db
from app.api.health import router as health_router
from app.api.jobs import router as jobs_router
from app.api.jd import router as jd_router
from app.api.candidates import router as candidates_router
from app.api.match import router as match_router
from app.api.recommendations import router as recommendations_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database tables...")
    init_db()
    print("Database initialization complete.")
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.6.0",
    description="Backend API for AI-Based Skill Gap & Employment Recommendation System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_V1_PREFIX)
app.include_router(jobs_router, prefix=settings.API_V1_PREFIX)
app.include_router(jd_router, prefix=settings.API_V1_PREFIX)
app.include_router(candidates_router, prefix=settings.API_V1_PREFIX)
app.include_router(match_router, prefix=settings.API_V1_PREFIX)
app.include_router(recommendations_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
        "match_engine": f"{settings.API_V1_PREFIX}/match/evaluate-job",
        "recommendations": f"{settings.API_V1_PREFIX}/recommendations/dashboard/{{candidate_id}}"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

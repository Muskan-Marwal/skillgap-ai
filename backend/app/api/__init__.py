"""API routes package initialization."""
from app.api.health import router as health_router
from app.api.jobs import router as jobs_router
from app.api.jd import router as jd_router
from app.api.candidates import router as candidates_router
from app.api.match import router as match_router

__all__ = [
    "health_router",
    "jobs_router",
    "jd_router",
    "candidates_router",
    "match_router",
]

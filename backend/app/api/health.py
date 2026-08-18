from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.database.session import get_db
from app.schemas.common import HealthCheckResponse, SystemInfoResponse

router = APIRouter(prefix="/health", tags=["Health & Status"])


@router.get("", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    """Check API and Database health status."""
    db_connected = False
    try:
        # Execute a lightweight ping query
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    return HealthCheckResponse(
        status="healthy" if db_connected else "degraded",
        app_name=settings.APP_NAME,
        database_connected=db_connected,
        version="0.1.0 (Phase 1 Foundation)"
    )


@router.get("/system-info", response_model=SystemInfoResponse)
def system_info():
    """Retrieve non-sensitive system configuration and model weights."""
    return SystemInfoResponse(
        app_name=settings.APP_NAME,
        debug=settings.DEBUG,
        database_url=settings.DATABASE_URL,
        adzuna_configured=bool(settings.ADZUNA_APP_ID and settings.ADZUNA_APP_KEY),
        embedding_model=settings.EMBEDDING_MODEL,
        weights={
            "required": settings.WEIGHT_REQUIRED,
            "preferred": settings.WEIGHT_PREFERRED,
            "bonus": settings.WEIGHT_BONUS,
            "experience": settings.WEIGHT_EXPERIENCE,
        }
    )

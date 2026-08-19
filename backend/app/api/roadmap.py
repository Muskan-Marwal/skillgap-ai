from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.roadmap_service import roadmap_service

router = APIRouter(prefix="/roadmap", tags=["Personalized Learning Roadmap"])


@router.get("/job/{candidate_id}/{job_id}")
def get_job_roadmap(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    """Personalized learning roadmap for a specific job's skill gaps with free resources."""
    try:
        return roadmap_service.build_job_roadmap(db, candidate_id, job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Roadmap generation failed: {str(e)}"
        )


@router.get("/global/{candidate_id}")
def get_global_roadmap(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Cross-job learning roadmap based on recurring gaps across all evaluated jobs."""
    try:
        return roadmap_service.build_global_roadmap(db, candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Global roadmap failed: {str(e)}"
        )

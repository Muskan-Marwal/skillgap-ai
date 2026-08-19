from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/recommendations", tags=["Tiered Recommendations"])


@router.get("/dashboard/{candidate_id}")
def get_recommendations_dashboard(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """
    Build a tri-tier recommendation dashboard for the active candidate.
    Groups all evaluated (or newly evaluated) jobs into:
    - APPLY NOW   (≥78% fit)
    - ALMOST READY (52–77%)
    - FUTURE TARGET (<52%)
    Returns recurring skill gap analytics across all evaluated jobs.
    """
    try:
        return recommendation_service.build_tiered_recommendations(
            db=db,
            candidate_id=candidate_id
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build recommendations: {str(e)}"
        )


@router.post("/dashboard/{candidate_id}/refresh")
def refresh_recommendations_dashboard(
    candidate_id: int,
    job_ids: Optional[List[int]] = None,
    db: Session = Depends(get_db)
):
    """
    Force a fresh evaluation and rebuild the recommendation dashboard.
    Optionally accepts a specific list of job_ids to restrict evaluation scope.
    """
    try:
        return recommendation_service.build_tiered_recommendations(
            db=db,
            candidate_id=candidate_id,
            job_ids=job_ids
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to refresh recommendations: {str(e)}"
        )

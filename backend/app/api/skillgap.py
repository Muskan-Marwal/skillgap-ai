from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.explainability_service import explainability_service

router = APIRouter(prefix="/skillgap", tags=["Skill Gap & Explainability"])


@router.get("/report/{candidate_id}/job/{job_id}")
def get_explainability_report(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    """Full explainability report: score rationale, evidence provenance, gap priority matrix."""
    try:
        return explainability_service.build_explainability_report(db, candidate_id, job_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Explainability report failed: {str(e)}"
        )


@router.get("/summary/{candidate_id}")
def get_candidate_gap_summary(
    candidate_id: int,
    db: Session = Depends(get_db)
):
    """Cross-job gap analytics: which skills block the most jobs, candidate strengths."""
    try:
        return explainability_service.build_candidate_gap_summary(db, candidate_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gap summary failed: {str(e)}"
        )

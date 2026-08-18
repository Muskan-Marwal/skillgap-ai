from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.match import (
    JobMatchResult,
    MatchEvaluationRequest,
    BatchMatchEvaluationRequest,
)
from app.services.match_service import match_service

router = APIRouter(prefix="/match", tags=["Semantic Matching Engine"])


@router.post("/evaluate-job", response_model=JobMatchResult)
def evaluate_single_job(
    request: MatchEvaluationRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluate candidate demonstrated evidence against a specific job's extracted requirements.
    Uses sentence-transformers/all-MiniLM-L6-v2 embeddings and evidence weighting.
    """
    try:
        result = match_service.evaluate_candidate_job_match(
            db=db,
            candidate_id=request.candidate_id,
            job_id=request.job_id
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic matching failure: {str(e)}"
        )


@router.post("/evaluate-all-jobs", response_model=List[JobMatchResult])
def evaluate_batch_jobs(
    request: BatchMatchEvaluationRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluate active candidate against multiple jobs in SQLite.
    Returns ranked list of evaluated job match results sorted by overall fit score.
    """
    try:
        results = match_service.evaluate_batch_jobs(
            db=db,
            candidate_id=request.candidate_id,
            job_ids=request.job_ids
        )
        return results
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch matching failure: {str(e)}"
        )


@router.get("/{candidate_id}/job/{job_id}", response_model=JobMatchResult)
def get_match_result(
    candidate_id: int,
    job_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve existing match evaluation result for candidate and job."""
    try:
        return match_service.evaluate_candidate_job_match(
            db=db,
            candidate_id=candidate_id,
            job_id=job_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

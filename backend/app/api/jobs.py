from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.job import (
    JobSearchRequest,
    JobResponse,
    JobSearchResponse,
    CachedStatsResponse,
)
from app.services.job_service import job_service

router = APIRouter(prefix="/jobs", tags=["Jobs & Adzuna Discovery"])


@router.post("/search", response_model=JobSearchResponse)
def search_jobs(
    search_req: JobSearchRequest,
    db: Session = Depends(get_db)
):
    """
    Search for jobs via the Adzuna API (or SQLite cache).
    Every retrieved job is automatically cached in SQLite.
    """
    results = job_service.search_jobs(
        db=db,
        query=search_req.query,
        location=search_req.location or "",
        country=search_req.country or "gb",
        page=search_req.page or 1,
        results_per_page=search_req.results_per_page or 15,
        use_cache_only=search_req.use_cache_only or False,
    )
    return results


@router.get("/cached/stats", response_model=CachedStatsResponse)
def get_cached_stats(db: Session = Depends(get_db)):
    """Retrieve statistics about cached jobs in SQLite."""
    return job_service.get_cached_stats(db)


@router.get("/{job_id}", response_model=JobResponse)
def get_job_by_id(job_id: int, db: Session = Depends(get_db)):
    """Retrieve a single job by its database ID."""
    job = job_service.get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} was not found in the database."
        )
    return job

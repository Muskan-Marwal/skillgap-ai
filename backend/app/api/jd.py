from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.jd import JobRequirementsProfile, CanonicalSkillsListResponse
from app.services.jd_service import jd_service

router = APIRouter(prefix="/jd", tags=["JD Intelligence & Requirements"])


@router.post("/parse/{job_id}", response_model=JobRequirementsProfile)
def parse_job_requirements(job_id: int, db: Session = Depends(get_db)):
    """
    Extract structured required, preferred, and bonus skills from a job's description.
    Results are normalized against canonical ESCO taxonomy and persisted in SQLite.
    """
    try:
        profile = jd_service.extract_and_store_requirements(db, job_id)
        return profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to extract requirements from JD: {str(e)}"
        )


@router.get("/{job_id}/requirements", response_model=JobRequirementsProfile)
def get_job_requirements(job_id: int, db: Session = Depends(get_db)):
    """Retrieve existing extracted requirements profile for a job."""
    try:
        return jd_service.extract_and_store_requirements(db, job_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/skills/canonical", response_model=CanonicalSkillsListResponse)
def get_canonical_skills():
    """Retrieve all canonical ESCO skills, categories, and synonyms."""
    return jd_service.get_canonical_taxonomy()

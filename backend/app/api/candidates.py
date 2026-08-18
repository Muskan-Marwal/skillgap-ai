from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.candidate import (
    CandidateProfileResponse,
    CandidateListItemResponse,
)
from app.services.candidate_service import candidate_service

router = APIRouter(prefix="/candidates", tags=["Candidate Intelligence"])


@router.post("/upload-resume", response_model=CandidateProfileResponse)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form("Data Scientist"),
    db: Session = Depends(get_db)
):
    """
    Upload a candidate resume PDF for local PyMuPDF parsing.
    Extracts projects, experience, education, and ESCO-normalized skills with evidence provenance.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF resume documents are supported."
        )

    # Read PDF content (limit file size to 5MB for security)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB maximum limit."
        )

    try:
        profile = candidate_service.parse_and_store_pdf_resume(
            db=db,
            pdf_bytes=contents,
            target_role=target_role
        )
        return profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )


@router.post("/load-preset/{preset_id}", response_model=CandidateProfileResponse)
def load_candidate_preset(preset_id: str, db: Session = Depends(get_db)):
    """
    Load a pre-configured realistic candidate resume for instant 1-click evaluation.
    Available presets: 'junior-data-scientist', 'python-backend-dev'.
    """
    try:
        return candidate_service.load_demo_preset(db, preset_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/recent/list", response_model=List[CandidateListItemResponse])
def list_recent_candidates(db: Session = Depends(get_db)):
    """Retrieve recent candidate profiles stored in SQLite."""
    return candidate_service.list_recent_candidates(db)


@router.get("/{candidate_id}", response_model=CandidateProfileResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific candidate profile with project and evidence breakdown."""
    try:
        return candidate_service.get_candidate_profile(db, candidate_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

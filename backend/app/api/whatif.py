from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.whatif_service import whatif_service

router = APIRouter(prefix="/whatif", tags=["What-If Skill Simulation"])


class WhatIfRequest(BaseModel):
    candidate_id: int
    job_id: int
    added_skills: List[str]


class WhatIfGlobalRequest(BaseModel):
    candidate_id: int
    added_skills: List[str]


@router.post("/simulate")
def simulate_whatif(
    request: WhatIfRequest,
    db: Session = Depends(get_db)
):
    """Simulate adding skills to candidate profile and recalculate match score for a specific job."""
    try:
        return whatif_service.simulate(
            db, request.candidate_id, request.job_id, request.added_skills
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"What-If simulation failed: {str(e)}"
        )


@router.post("/simulate-global")
def simulate_whatif_global(
    request: WhatIfGlobalRequest,
    db: Session = Depends(get_db)
):
    """Simulate adding skills across all previously evaluated jobs."""
    try:
        return whatif_service.simulate_global(
            db, request.candidate_id, request.added_skills
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Global what-if simulation failed: {str(e)}"
        )

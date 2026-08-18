from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class CandidateSkillResponse(BaseModel):
    id: int
    canonical_skill: str
    category: str
    source: str = Field(..., description="experience | project | certification | skills_section | education")
    evidence_text: Optional[str] = None
    project_name: Optional[str] = None
    confidence: float

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    technologies: Optional[str] = None

    class Config:
        from_attributes = True


class CandidateProfileResponse(BaseModel):
    id: int
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    education: Optional[str] = None
    experience_years: float = 0.0
    location: Optional[str] = None
    target_role: Optional[str] = None
    total_skills_detected: int
    skills_by_evidence: Dict[str, List[CandidateSkillResponse]]
    skills: List[CandidateSkillResponse]
    projects: List[ProjectResponse]
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class CandidateListItemResponse(BaseModel):
    id: int
    name: Optional[str]
    target_role: Optional[str]
    experience_years: float
    total_skills: int
    created_at: Optional[datetime]

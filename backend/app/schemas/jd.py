from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ExtractedSkillSchema(BaseModel):
    canonical_skill: str
    category: str
    requirement_type: str = Field(..., description="required | preferred | bonus")
    evidence_clause: str
    confidence: float = 1.0


class JobRequirementsProfile(BaseModel):
    job_id: int
    job_title: str
    company: Optional[str] = "Confidential"
    total_skills_extracted: int
    experience_years_required: Optional[float] = None
    education_required: Optional[str] = None
    required_skills: List[ExtractedSkillSchema]
    preferred_skills: List[ExtractedSkillSchema]
    bonus_skills: List[ExtractedSkillSchema]


class CanonicalSkillResponse(BaseModel):
    canonical_name: str
    category: str
    esco_id: str
    synonyms: List[str]


class CanonicalSkillsListResponse(BaseModel):
    total_skills: int
    categories: List[str]
    skills: List[CanonicalSkillResponse]

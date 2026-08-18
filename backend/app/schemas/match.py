from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class MatchedSkillDetail(BaseModel):
    canonical_skill: str
    requirement_type: str = Field(..., description="required | preferred | bonus")
    matched_candidate_skill: str
    similarity_score: float
    evidence_source: str = Field(..., description="experience | project | certification | skills_section | education")
    evidence_text: Optional[str] = None
    project_name: Optional[str] = None
    confidence_weight: float


class MissingSkillDetail(BaseModel):
    canonical_skill: str
    requirement_type: str
    category: str
    priority: str = Field(..., description="High (Required) | Medium (Preferred) | Low (Bonus)")
    importance_reason: str


class ScoreBreakdown(BaseModel):
    required_coverage: float
    preferred_coverage: float
    bonus_coverage: float
    experience_fit: float
    weighted_score: float
    weights_used: Dict[str, float]


class JobMatchResult(BaseModel):
    job_id: int
    candidate_id: int
    job_title: str
    company: Optional[str] = "Confidential"
    location: Optional[str] = None
    overall_fit_score: float = Field(..., description="0.0 to 100.0 Job-Fit Alignment Score")
    classification: str = Field(..., description="APPLY NOW | ALMOST READY | FUTURE TARGET")
    matched_skills: List[MatchedSkillDetail]
    missing_skills: List[MissingSkillDetail]
    score_breakdown: ScoreBreakdown
    created_at: Optional[datetime] = None


class MatchEvaluationRequest(BaseModel):
    candidate_id: int
    job_id: int


class BatchMatchEvaluationRequest(BaseModel):
    candidate_id: int
    job_ids: Optional[List[int]] = None

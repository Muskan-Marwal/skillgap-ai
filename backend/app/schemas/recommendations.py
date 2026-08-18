from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.match import JobMatchResult, MatchedSkillDetail, MissingSkillDetail, ScoreBreakdown


class RecommendationCard(BaseModel):
    job_id: int
    job_title: str
    company: Optional[str] = "Confidential"
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    original_url: Optional[str] = None
    overall_fit_score: float
    classification: str = Field(..., description="APPLY NOW | ALMOST READY | FUTURE TARGET")
    tier_reason: str
    matched_skills_summary: List[str]
    critical_missing_skills: List[str]
    score_breakdown: ScoreBreakdown
    full_match_details: JobMatchResult


class TierGroup(BaseModel):
    tier_name: str
    tier_description: str
    badge_color: str
    count: int
    jobs: List[RecommendationCard]


class TieredRecommendationsResponse(BaseModel):
    candidate_id: int
    candidate_name: str
    target_role: Optional[str]
    total_evaluated_jobs: int
    average_fit_score: float
    apply_now: TierGroup
    almost_ready: TierGroup
    future_target: TierGroup
    top_recurring_gaps: List[Dict[str, Any]]

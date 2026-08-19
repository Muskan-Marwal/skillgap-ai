from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EvidenceProvenance(BaseModel):
    canonical_skill: str
    category: str
    confidence_weight: float
    evidence_source: str = Field(..., description="experience | project | certification | skills_section | education")
    evidence_source_label: str
    evidence_text: str
    project_name: Optional[str] = None
    similarity_score: Optional[float] = None
    requirement_type: str = Field(..., description="required | preferred | bonus")


class GapItem(BaseModel):
    canonical_skill: str
    category: str
    requirement_type: str
    priority: str
    frequency_across_jobs: int
    percentage_jobs_requiring: float
    importance_reason: str
    suggested_action: str


class ScoreRationale(BaseModel):
    overall_score: float
    classification: str
    formula_breakdown: str
    required_coverage: float
    required_weight: float
    required_contribution: float
    preferred_coverage: float
    preferred_weight: float
    preferred_contribution: float
    bonus_coverage: float
    bonus_weight: float
    bonus_contribution: float
    experience_fit: float
    experience_weight: float
    experience_contribution: float
    limiting_factor: str
    next_tier_advice: str


class ExplainabilityReport(BaseModel):
    candidate_id: int
    candidate_name: str
    job_id: int
    job_title: str
    company: Optional[str]
    overall_fit_score: float
    classification: str
    score_rationale: ScoreRationale
    evidence_provenance: List[EvidenceProvenance]
    gap_priority_matrix: Dict[str, List[GapItem]]
    total_matched: int
    total_missing: int


class CandidateGapSummary(BaseModel):
    candidate_id: int
    candidate_name: str
    target_role: Optional[str]
    total_jobs_evaluated: int
    global_gaps: List[GapItem]
    strength_skills: List[str]
    improvement_areas: List[str]

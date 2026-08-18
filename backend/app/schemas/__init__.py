"""Pydantic schemas package initialization."""
from app.schemas.common import HealthCheckResponse, SystemInfoResponse
from app.schemas.job import (
    JobSearchRequest,
    JobResponse,
    JobSearchResponse,
    CachedStatsResponse,
)
from app.schemas.jd import (
    ExtractedSkillSchema,
    JobRequirementsProfile,
    CanonicalSkillResponse,
    CanonicalSkillsListResponse,
)
from app.schemas.candidate import (
    CandidateSkillResponse,
    ProjectResponse,
    CandidateProfileResponse,
    CandidateListItemResponse,
)
from app.schemas.match import (
    MatchedSkillDetail,
    MissingSkillDetail,
    ScoreBreakdown,
    JobMatchResult,
    MatchEvaluationRequest,
    BatchMatchEvaluationRequest,
)

__all__ = [
    "HealthCheckResponse",
    "SystemInfoResponse",
    "JobSearchRequest",
    "JobResponse",
    "JobSearchResponse",
    "CachedStatsResponse",
    "ExtractedSkillSchema",
    "JobRequirementsProfile",
    "CanonicalSkillResponse",
    "CanonicalSkillsListResponse",
    "CandidateSkillResponse",
    "ProjectResponse",
    "CandidateProfileResponse",
    "CandidateListItemResponse",
    "MatchedSkillDetail",
    "MissingSkillDetail",
    "ScoreBreakdown",
    "JobMatchResult",
    "MatchEvaluationRequest",
    "BatchMatchEvaluationRequest",
]

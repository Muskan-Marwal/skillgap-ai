from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class JobSearchRequest(BaseModel):
    query: str = Field(..., example="Data Scientist", description="Job title or role keyword")
    location: Optional[str] = Field("", example="London", description="City, region, or country")
    country: Optional[str] = Field("gb", example="gb", description="Adzuna country code: gb, us, in")
    page: Optional[int] = Field(1, ge=1, description="Page number")
    results_per_page: Optional[int] = Field(15, ge=1, le=50, description="Number of results per page")
    use_cache_only: Optional[bool] = Field(False, description="Force retrieval from local SQLite cache only")


class JobResponse(BaseModel):
    id: int
    source_job_id: str
    title: str
    company: Optional[str] = "Confidential"
    location: Optional[str] = "Remote / Unspecified"
    description: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    original_url: Optional[str] = None
    created_date: Optional[str] = None
    is_cached: bool = False
    retrieved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobSearchResponse(BaseModel):
    total_found: int
    page: int
    country: str
    is_from_cache: bool
    api_available: bool
    jobs: List[JobResponse]


class CachedStatsResponse(BaseModel):
    total_cached_jobs: int
    roles_cached: List[str]
    recent_jobs: List[JobResponse]

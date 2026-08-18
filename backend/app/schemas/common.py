from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="healthy")
    app_name: str = Field(..., example="AI-Based Skill Gap & Employment Recommendation System")
    database_connected: bool = Field(..., example=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = Field(..., example="0.1.0 (Phase 1 MVP)")


class SystemInfoResponse(BaseModel):
    app_name: str
    debug: bool
    database_url: str
    adzuna_configured: bool
    embedding_model: str
    weights: Dict[str, float]

import os
from typing import List, Tuple
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI-Based Skill Gap & Employment Recommendation System"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = "sqlite:///./skillgap.db"

    # Adzuna API (reads from .env in current directory or parent directory)
    ADZUNA_APP_ID: str = ""
    ADZUNA_APP_KEY: str = ""
    ADZUNA_COUNTRY: str = "gb"

    # Matching Weights
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    WEIGHT_REQUIRED: float = 0.60
    WEIGHT_PREFERRED: float = 0.25
    WEIGHT_BONUS: float = 0.10
    WEIGHT_EXPERIENCE: float = 0.05

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        # Check both local .env and parent .env automatically
        env_file=(".env", "../.env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

"""ML package initialization."""
from app.ml.esco_skills import (
    ESCO_TAXONOMY,
    SYNONYM_MAP,
    normalize_skill,
    get_all_canonical_skills,
    get_skill_category,
)
from app.ml.matcher import embedding_matcher, EmbeddingMatcher

__all__ = [
    "ESCO_TAXONOMY",
    "SYNONYM_MAP",
    "normalize_skill",
    "get_all_canonical_skills",
    "get_skill_category",
    "embedding_matcher",
    "EmbeddingMatcher",
]

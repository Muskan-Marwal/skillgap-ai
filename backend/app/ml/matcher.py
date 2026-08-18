import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from app.core.config import settings
from app.ml.esco_skills import get_skill_category


class EmbeddingMatcher:
    """
    Semantic Matching Engine using local sentence-transformers/all-MiniLM-L6-v2.
    Computes weighted job-fit alignment between candidate evidence and job requirements.
    """

    SIMILARITY_THRESHOLD = 0.65

    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self._model = None
        self._model_load_attempted = False

    def _get_model(self):
        """Lazy loader for SentenceTransformer model."""
        if self._model is None and not self._model_load_attempted:
            self._model_load_attempted = True
            try:
                from sentence_transformers import SentenceTransformer
                print(f"[EmbeddingMatcher] Loading local embedding model: {self.model_name}...")
                self._model = SentenceTransformer(self.model_name)
                print("[EmbeddingMatcher] Model loaded successfully on local CPU.")
            except Exception as e:
                print(f"[EmbeddingMatcher] Warning: Could not load SentenceTransformer ({e}). Using lexical fallback.")
                self._model = None
        return self._model

    def encode_texts(self, texts: List[str]) -> np.ndarray:
        """Generate dense vector embeddings for input strings."""
        if not texts:
            return np.empty((0, 384))

        model = self._get_model()
        if model is not None:
            try:
                embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings
            except Exception as e:
                print(f"[EmbeddingMatcher] Encoding exception: {e}")

        # Fallback pseudo-embedding based on character n-grams if model is unavailable
        vectors = []
        for t in texts:
            t_lower = t.lower()
            # Simple 384-dimensional hashed representation for graceful offline resilience
            vec = np.zeros(384, dtype=np.float32)
            for i, char in enumerate(t_lower):
                idx = (ord(char) * (i + 1) * 31) % 384
                vec[idx] += 1.0
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            vectors.append(vec)
        return np.array(vectors)

    def match_candidate_to_job(
        self,
        candidate_data: Dict[str, Any],
        job_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Compute weighted semantic alignment score and generate explainable breakdown.
        """
        candidate_skills = candidate_data.get("skills", [])
        cand_exp_years = float(candidate_data.get("experience_years", 0.0) or 0.0)

        required_reqs = job_requirements.get("required_skills", [])
        preferred_reqs = job_requirements.get("preferred_skills", [])
        bonus_reqs = job_requirements.get("bonus_skills", [])
        job_req_exp_years = job_requirements.get("experience_years_required")

        # 1. Prepare texts for embedding
        cand_texts = [
            f"{s['canonical_skill']}: {s.get('evidence_text', '')}"
            for s in candidate_skills
        ]
        
        all_job_reqs = required_reqs + preferred_reqs + bonus_reqs
        job_texts = [
            f"{r['canonical_skill']}: {r.get('evidence_clause', '')}"
            for r in all_job_reqs
        ]

        cand_embeddings = self.encode_texts(cand_texts) if cand_texts else np.empty((0, 384))
        job_embeddings = self.encode_texts(job_texts) if job_texts else np.empty((0, 384))

        # Compute cosine similarity matrix
        sim_matrix = np.zeros((len(all_job_reqs), len(candidate_skills)))
        if len(cand_embeddings) > 0 and len(job_embeddings) > 0:
            sim_matrix = cosine_similarity(job_embeddings, cand_embeddings)

        matched_skills: List[Dict[str, Any]] = []
        missing_skills: List[Dict[str, Any]] = []

        def evaluate_group(req_list: List[Dict[str, Any]], start_idx: int) -> Tuple[float, List[Dict[str, Any]], List[Dict[str, Any]]]:
            if not req_list:
                return 1.0, [], []  # If no requirements in this tier, full credit

            group_matches = []
            group_misses = []
            coverage_sum = 0.0

            for i, req in enumerate(req_list):
                global_idx = start_idx + i
                req_skill = req["canonical_skill"]
                req_type = req["requirement_type"]

                best_sim = 0.0
                best_cand_skill = None
                best_evidence_source = None
                best_evidence_text = None
                best_proj_name = None
                best_confidence = 0.0
                best_weighted_match = 0.0

                for j, c_skill in enumerate(candidate_skills):
                    sim = float(sim_matrix[global_idx, j]) if len(cand_embeddings) > 0 else 0.0
                    
                    # Exact canonical skill match boost
                    if req_skill.lower() == c_skill["canonical_skill"].lower():
                        sim = max(sim, 1.0)

                    conf = float(c_skill.get("confidence", 0.5))
                    weighted_sim = sim * conf

                    if weighted_sim > best_weighted_match:
                        best_weighted_match = weighted_sim
                        best_sim = sim
                        best_cand_skill = c_skill["canonical_skill"]
                        best_evidence_source = c_skill.get("source", "skills_section")
                        best_evidence_text = c_skill.get("evidence_text")
                        best_proj_name = c_skill.get("project_name")
                        best_confidence = conf

                if best_sim >= self.SIMILARITY_THRESHOLD or best_weighted_match >= 0.50:
                    coverage_sum += min(1.0, best_weighted_match / 0.85)  # Normalized evidence coverage
                    match_item = {
                        "canonical_skill": req_skill,
                        "requirement_type": req_type,
                        "matched_candidate_skill": best_cand_skill or req_skill,
                        "similarity_score": round(best_sim, 2),
                        "evidence_source": best_evidence_source or "project",
                        "evidence_text": best_evidence_text or "Demonstrated in candidate profile",
                        "project_name": best_proj_name,
                        "confidence_weight": round(best_confidence, 2),
                    }
                    group_matches.append(match_item)
                else:
                    priority_label = (
                        "High (Required)" if req_type == "required"
                        else "Medium (Preferred)" if req_type == "preferred"
                        else "Low (Bonus)"
                    )
                    reason = (
                        f"Company requires {req_skill} for core responsibilities but candidate profile lacks demonstrated evidence."
                        if req_type == "required"
                        else f"Company lists {req_skill} as preferred; having it boosts competitive alignment."
                    )
                    miss_item = {
                        "canonical_skill": req_skill,
                        "requirement_type": req_type,
                        "category": get_skill_category(req_skill),
                        "priority": priority_label,
                        "importance_reason": reason,
                    }
                    group_misses.append(miss_item)

            avg_coverage = coverage_sum / len(req_list)
            return avg_coverage, group_matches, group_misses

        # Evaluate each tier
        req_cov, req_matches, req_misses = evaluate_group(required_reqs, 0)
        pref_cov, pref_matches, pref_misses = evaluate_group(preferred_reqs, len(required_reqs))
        bonus_cov, bonus_matches, bonus_misses = evaluate_group(bonus_reqs, len(required_reqs) + len(preferred_reqs))

        matched_skills = req_matches + pref_matches + bonus_matches
        missing_skills = req_misses + pref_misses + bonus_misses

        # Experience fit calculation
        if job_req_exp_years and job_req_exp_years > 0:
            exp_fit = min(1.0, cand_exp_years / job_req_exp_years)
        else:
            exp_fit = 1.0

        # Weighted Score Formulation
        w_req = settings.WEIGHT_REQUIRED
        w_pref = settings.WEIGHT_PREFERRED
        w_bonus = settings.WEIGHT_BONUS
        w_exp = settings.WEIGHT_EXPERIENCE

        total_weighted_fit = (
            (w_req * req_cov) +
            (w_pref * pref_cov) +
            (w_bonus * bonus_cov) +
            (w_exp * exp_fit)
        ) * 100.0

        total_score = round(max(0.0, min(100.0, total_weighted_fit)), 1)

        # Classification Heuristic
        if total_score >= 78.0 and req_cov >= 0.70:
            classification = "APPLY NOW"
        elif total_score >= 52.0:
            classification = "ALMOST READY"
        else:
            classification = "FUTURE TARGET"

        return {
            "overall_fit_score": total_score,
            "classification": classification,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "score_breakdown": {
                "required_coverage": round(req_cov * 100.0, 1),
                "preferred_coverage": round(pref_cov * 100.0, 1),
                "bonus_coverage": round(bonus_cov * 100.0, 1),
                "experience_fit": round(exp_fit * 100.0, 1),
                "weighted_score": total_score,
                "weights_used": {
                    "required": w_req,
                    "preferred": w_pref,
                    "bonus": w_bonus,
                    "experience": w_exp,
                }
            }
        }


embedding_matcher = EmbeddingMatcher()

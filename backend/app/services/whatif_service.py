import json
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.schema import MatchResult, Job, Candidate, CandidateSkill
from app.services.candidate_service import candidate_service
from app.services.jd_service import jd_service
from app.ml.matcher import embedding_matcher
from app.ml.esco_skills import normalize_skill, get_skill_category


class WhatIfService:
    """Simulates adding skills to a candidate's profile and recalculates match scores."""

    def simulate(
        self,
        db: Session,
        candidate_id: int,
        job_id: int,
        added_skills: List[str],
    ) -> Dict[str, Any]:
        """
        Run a what-if simulation: temporarily add skills to the candidate profile,
        re-run the matching engine, and compare original vs simulated scores.
        """
        candidate_profile = candidate_service.get_candidate_profile(db, candidate_id)
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job {job_id} not found.")

        original_result = self._get_original_match(db, candidate_id, job_id)
        original_score = original_result.get("overall_fit_score", 0.0)
        original_classification = original_result.get("classification", "FUTURE TARGET")

        simulated_profile = dict(candidate_profile)
        simulated_skills = list(simulated_profile.get("skills", []))

        normalized_added = []
        for raw_skill in added_skills:
            canonical = normalize_skill(raw_skill) or raw_skill.strip().title()
            normalized_added.append(canonical)
            simulated_skills.append({
                "canonical_skill": canonical,
                "category": get_skill_category(canonical),
                "source": "whatif_simulation",
                "evidence_text": f"Simulated: candidate adds {canonical} to their profile.",
                "project_name": None,
                "confidence": 0.75,
            })

        simulated_profile["skills"] = simulated_skills

        job_requirements = jd_service.extract_and_store_requirements(db, job_id)
        simulated_match = embedding_matcher.match_candidate_to_job(
            candidate_data=simulated_profile,
            job_requirements=job_requirements,
        )

        new_score = simulated_match["overall_fit_score"]
        new_classification = simulated_match["classification"]
        score_delta = round(new_score - original_score, 1)

        previously_missing = original_result.get("missing_skills", [])
        now_missing = simulated_match.get("missing_skills", [])

        previously_missing_names = {m["canonical_skill"] for m in previously_missing}
        now_missing_names = {m["canonical_skill"] for m in now_missing}
        gaps_closed = list(previously_missing_names - now_missing_names)
        remaining_gaps = list(now_missing_names)

        tier_changed = original_classification != new_classification

        return {
            "candidate_id": candidate_id,
            "candidate_name": candidate_profile.get("name", "Candidate"),
            "job_id": job_id,
            "job_title": job.title,
            "company": job.company,
            "added_skills": normalized_added,
            "original_score": original_score,
            "original_classification": original_classification,
            "simulated_score": new_score,
            "simulated_classification": new_classification,
            "score_delta": score_delta,
            "tier_changed": tier_changed,
            "gaps_closed": gaps_closed,
            "remaining_gaps": remaining_gaps,
            "remaining_gap_count": len(remaining_gaps),
            "simulated_breakdown": simulated_match.get("score_breakdown", {}),
            "original_breakdown": original_result.get("score_breakdown", {}),
        }

    def simulate_global(
        self,
        db: Session,
        candidate_id: int,
        added_skills: List[str],
    ) -> Dict[str, Any]:
        """Simulate adding skills across all previously evaluated jobs."""
        all_results = db.query(MatchResult).filter(
            MatchResult.candidate_id == candidate_id
        ).all()

        if not all_results:
            raise ValueError("No match results found. Evaluate jobs first.")

        job_simulations = []
        total_original = 0.0
        total_simulated = 0.0
        tier_upgrades = 0

        for mr in all_results:
            try:
                sim = self.simulate(db, candidate_id, mr.job_id, added_skills)
                job_simulations.append({
                    "job_id": sim["job_id"],
                    "job_title": sim["job_title"],
                    "company": sim["company"],
                    "original_score": sim["original_score"],
                    "simulated_score": sim["simulated_score"],
                    "score_delta": sim["score_delta"],
                    "original_classification": sim["original_classification"],
                    "simulated_classification": sim["simulated_classification"],
                    "tier_changed": sim["tier_changed"],
                })
                total_original += sim["original_score"]
                total_simulated += sim["simulated_score"]
                if sim["tier_changed"]:
                    tier_upgrades += 1
            except Exception:
                continue

        n = max(len(job_simulations), 1)
        normalized_added = [normalize_skill(s) or s.strip().title() for s in added_skills]

        return {
            "candidate_id": candidate_id,
            "added_skills": normalized_added,
            "total_jobs_simulated": len(job_simulations),
            "average_original_score": round(total_original / n, 1),
            "average_simulated_score": round(total_simulated / n, 1),
            "average_score_delta": round((total_simulated - total_original) / n, 1),
            "tier_upgrades": tier_upgrades,
            "job_simulations": sorted(
                job_simulations, key=lambda x: x["score_delta"], reverse=True
            ),
        }

    def _get_original_match(
        self, db: Session, candidate_id: int, job_id: int
    ) -> Dict[str, Any]:
        cached = (
            db.query(MatchResult)
            .filter(MatchResult.candidate_id == candidate_id, MatchResult.job_id == job_id)
            .first()
        )
        if cached and cached.breakdown_json:
            bd = json.loads(cached.breakdown_json)
            return {
                "overall_fit_score": cached.score,
                "classification": cached.classification,
                "matched_skills": bd.get("matched_skills", []),
                "missing_skills": bd.get("missing_skills", []),
                "score_breakdown": bd.get("score_breakdown", {}),
            }
        from app.services.match_service import match_service
        return match_service.evaluate_candidate_job_match(db, candidate_id, job_id)


whatif_service = WhatIfService()

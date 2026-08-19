from collections import Counter
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema import Job, MatchResult, Candidate, JobRequirement
from app.services.match_service import match_service
from app.services.candidate_service import candidate_service


APPLY_NOW_THRESHOLD = 78.0
ALMOST_READY_THRESHOLD = 52.0


class RecommendationService:
    """
    Organises evaluated job-match results into Apply Now / Almost Ready /
    Future Target tiers and computes recurring skill gap analytics.
    """

    def _get_tier_reason(self, score: float, classification: str, matched_count: int, missing_count: int) -> str:
        if classification == "APPLY NOW":
            return (
                f"Your evidence matches {matched_count} of this company's requirements "
                f"with a {score:.0f}% alignment. You are a strong candidate — apply now."
            )
        elif classification == "ALMOST READY":
            return (
                f"You satisfy most key requirements ({matched_count} matched). "
                f"Closing {missing_count} skill gap(s) will bring you into the Apply Now tier."
            )
        else:
            return (
                f"This role requires significant additional skills ({missing_count} gaps). "
                f"It is a strong future target once you build your roadmap."
            )

    def build_tiered_recommendations(
        self,
        db: Session,
        candidate_id: int,
        job_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Evaluate (or re-use cached) match results and tier them into
        Apply Now / Almost Ready / Future Target groups.
        """
        candidate_profile = candidate_service.get_candidate_profile(db, candidate_id)

        # Resolve job list
        if not job_ids:
            all_jobs = db.query(Job).limit(30).all()
            job_ids = [j.id for j in all_jobs]

        # Re-use cached match results where available; run matcher for new ones
        match_results = []
        for jid in job_ids:
            cached = (
                db.query(MatchResult)
                .filter(MatchResult.candidate_id == candidate_id, MatchResult.job_id == jid)
                .first()
            )
            if cached:
                import json
                breakdown = json.loads(cached.breakdown_json or "{}")
                job = db.query(Job).filter(Job.id == jid).first()
                match_results.append({
                    "job_id": jid,
                    "candidate_id": candidate_id,
                    "job_title": job.title if job else "Job Role",
                    "company": job.company if job else "Confidential",
                    "location": job.location if job else None,
                    "salary_min": job.salary_min if job else None,
                    "salary_max": job.salary_max if job else None,
                    "original_url": job.original_url if job else None,
                    "overall_fit_score": cached.score,
                    "classification": cached.classification,
                    "matched_skills": breakdown.get("matched_skills", []),
                    "missing_skills": breakdown.get("missing_skills", []),
                    "score_breakdown": breakdown.get("score_breakdown", {}),
                })
            else:
                try:
                    result = match_service.evaluate_candidate_job_match(db, candidate_id, jid)
                    job = db.query(Job).filter(Job.id == jid).first()
                    result["salary_min"] = job.salary_min if job else None
                    result["salary_max"] = job.salary_max if job else None
                    result["original_url"] = job.original_url if job else None
                    match_results.append(result)
                except Exception as e:
                    print(f"[RecommendationService] Skipping job {jid}: {e}")

        # Tier categorisation
        apply_now = []
        almost_ready = []
        future_target = []

        all_missing_skills = []

        for mr in match_results:
            score = mr["overall_fit_score"]
            classification = mr["classification"]
            matched = mr.get("matched_skills", [])
            missing = mr.get("missing_skills", [])

            all_missing_skills.extend([m["canonical_skill"] for m in missing])

            card = {
                "job_id": mr["job_id"],
                "job_title": mr["job_title"],
                "company": mr.get("company", "Confidential"),
                "location": mr.get("location"),
                "salary_min": mr.get("salary_min"),
                "salary_max": mr.get("salary_max"),
                "original_url": mr.get("original_url"),
                "overall_fit_score": score,
                "classification": classification,
                "tier_reason": self._get_tier_reason(score, classification, len(matched), len(missing)),
                "matched_skills_summary": [m["canonical_skill"] for m in matched[:6]],
                "critical_missing_skills": [
                    m["canonical_skill"] for m in missing
                    if m.get("requirement_type") == "required"
                ][:5],
                "score_breakdown": mr.get("score_breakdown", {}),
                "full_match_details": mr,
            }

            if classification == "APPLY NOW":
                apply_now.append(card)
            elif classification == "ALMOST READY":
                almost_ready.append(card)
            else:
                future_target.append(card)

        # Sort each tier by fit score descending
        apply_now.sort(key=lambda x: x["overall_fit_score"], reverse=True)
        almost_ready.sort(key=lambda x: x["overall_fit_score"], reverse=True)
        future_target.sort(key=lambda x: x["overall_fit_score"], reverse=True)

        # Recurring gap analytics
        gap_counts = Counter(all_missing_skills)
        top_recurring_gaps = [
            {"skill": skill, "frequency": count, "percentage": round(count / max(len(match_results), 1) * 100, 0)}
            for skill, count in gap_counts.most_common(8)
        ]

        all_scores = [mr["overall_fit_score"] for mr in match_results]
        avg_score = round(sum(all_scores) / max(len(all_scores), 1), 1)

        return {
            "candidate_id": candidate_id,
            "candidate_name": candidate_profile.get("name", "Candidate"),
            "target_role": candidate_profile.get("target_role"),
            "total_evaluated_jobs": len(match_results),
            "average_fit_score": avg_score,
            "apply_now": {
                "tier_name": "APPLY NOW",
                "tier_description": "≥78% fit — Strong match. Your evidence satisfies core requirements.",
                "badge_color": "emerald",
                "count": len(apply_now),
                "jobs": apply_now,
            },
            "almost_ready": {
                "tier_name": "ALMOST READY",
                "tier_description": "52–77% fit — Competitive candidate. Close a few gaps to unlock Apply Now.",
                "badge_color": "amber",
                "count": len(almost_ready),
                "jobs": almost_ready,
            },
            "future_target": {
                "tier_name": "FUTURE TARGET",
                "tier_description": "<52% fit — Aspirational role. Build a learning roadmap to close the gap.",
                "badge_color": "purple",
                "count": len(future_target),
                "jobs": future_target,
            },
            "top_recurring_gaps": top_recurring_gaps,
        }


recommendation_service = RecommendationService()

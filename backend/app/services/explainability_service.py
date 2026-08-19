import json
from collections import Counter, defaultdict
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema import MatchResult, Job, Candidate, CandidateSkill
from app.services.match_service import match_service
from app.services.candidate_service import candidate_service
from app.ml.esco_skills import get_skill_category


SOURCE_LABELS = {
    "experience": "Work / Internship Experience",
    "project": "Technical Project",
    "certification": "Certification / Course",
    "skills_section": "Explicit Skills List",
    "education": "Academic Education",
}

SUGGESTED_ACTIONS = {
    "required": "Priority: Build a hands-on project demonstrating this skill, then add it to your experience bullet points.",
    "preferred": "Recommended: Complete a short online course (Kaggle / freeCodeCamp / Microsoft Learn) and add it to certifications.",
    "bonus": "Optional: Include this in your skills section after completing an introductory tutorial.",
}


def _build_score_rationale(match_data: Dict[str, Any]) -> Dict[str, Any]:
    bd = match_data.get("score_breakdown", {})
    score = match_data.get("overall_fit_score", 0.0)
    classification = match_data.get("classification", "FUTURE TARGET")
    weights = bd.get("weights_used", {"required": 0.60, "preferred": 0.25, "bonus": 0.10, "experience": 0.05})

    req_cov = bd.get("required_coverage", 0.0)
    pref_cov = bd.get("preferred_coverage", 0.0)
    bonus_cov = bd.get("bonus_coverage", 0.0)
    exp_fit = bd.get("experience_fit", 0.0)

    w_req = weights.get("required", 0.60)
    w_pref = weights.get("preferred", 0.25)
    w_bonus = weights.get("bonus", 0.10)
    w_exp = weights.get("experience", 0.05)

    req_contrib = round(w_req * req_cov / 100 * 100, 1)
    pref_contrib = round(w_pref * pref_cov / 100 * 100, 1)
    bonus_contrib = round(w_bonus * bonus_cov / 100 * 100, 1)
    exp_contrib = round(w_exp * exp_fit / 100 * 100, 1)

    formula = (
        f"({w_req} × {req_cov}%) + ({w_pref} × {pref_cov}%) + "
        f"({w_bonus} × {bonus_cov}%) + ({w_exp} × {exp_fit}%) = {score}%"
    )

    # Identify limiting factor
    if req_cov < 60:
        limiting = f"Required skills coverage ({req_cov}%) is the primary bottleneck. Closing required gaps will have the largest impact on your score."
    elif pref_cov < 50:
        limiting = f"Preferred skills coverage ({pref_cov}%) is limiting your score. Adding 2–3 preferred skills could push you into the next tier."
    elif exp_fit < 80:
        limiting = f"Experience fit ({exp_fit}%) is slightly below this job's target. Building relevant project experience will help."
    else:
        limiting = "Your profile is well-aligned. Score is limited mainly by bonus/optional skills that are nice-to-have."

    # Next tier advice
    if classification == "APPLY NOW":
        advice = "You are in the Apply Now tier! Consider applying directly — your evidence strongly matches this role's requirements."
    elif classification == "ALMOST READY":
        gap = round(78 - score, 1)
        advice = f"You need approximately {gap}% more alignment to reach Apply Now. Focus on the High-priority required skill gaps listed below."
    else:
        gap = round(52 - score, 1)
        advice = f"You need approximately {gap}% more alignment to reach Almost Ready. Build a structured 4–8 week learning plan targeting the required skill gaps."

    return {
        "overall_score": score,
        "classification": classification,
        "formula_breakdown": formula,
        "required_coverage": req_cov,
        "required_weight": w_req,
        "required_contribution": req_contrib,
        "preferred_coverage": pref_cov,
        "preferred_weight": w_pref,
        "preferred_contribution": pref_contrib,
        "bonus_coverage": bonus_cov,
        "bonus_weight": w_bonus,
        "bonus_contribution": bonus_contrib,
        "experience_fit": exp_fit,
        "experience_weight": w_exp,
        "experience_contribution": exp_contrib,
        "limiting_factor": limiting,
        "next_tier_advice": advice,
    }


class ExplainabilityService:
    """
    Builds deep explainability reports for individual job-candidate match results,
    including evidence provenance, gap priority matrix, and score rationale.
    """

    def get_match_data(self, db: Session, candidate_id: int, job_id: int) -> Dict[str, Any]:
        """Retrieve cached match result or run fresh evaluation."""
        cached = (
            db.query(MatchResult)
            .filter(MatchResult.candidate_id == candidate_id, MatchResult.job_id == job_id)
            .first()
        )
        if cached and cached.breakdown_json:
            bd = json.loads(cached.breakdown_json)
            job = db.query(Job).filter(Job.id == job_id).first()
            return {
                "job_id": job_id,
                "candidate_id": candidate_id,
                "job_title": job.title if job else "Job Role",
                "company": job.company if job else "Confidential",
                "overall_fit_score": cached.score,
                "classification": cached.classification,
                "matched_skills": bd.get("matched_skills", []),
                "missing_skills": bd.get("missing_skills", []),
                "score_breakdown": bd.get("score_breakdown", {}),
            }
        return match_service.evaluate_candidate_job_match(db, candidate_id, job_id)

    def build_explainability_report(
        self,
        db: Session,
        candidate_id: int,
        job_id: int
    ) -> Dict[str, Any]:
        """
        Generate a full explainability report for a single job-candidate pair.
        """
        match_data = self.get_match_data(db, candidate_id, job_id)
        candidate_profile = candidate_service.get_candidate_profile(db, candidate_id)
        job = db.query(Job).filter(Job.id == job_id).first()

        # ── Evidence Provenance ──────────────────────────────────────────────
        evidence_provenance = []
        for item in match_data.get("matched_skills", []):
            canonical = item.get("canonical_skill", "")
            evidence_provenance.append({
                "canonical_skill": canonical,
                "category": get_skill_category(canonical),
                "confidence_weight": item.get("confidence_weight", 0.5),
                "evidence_source": item.get("evidence_source", "skills_section"),
                "evidence_source_label": SOURCE_LABELS.get(
                    item.get("evidence_source", "skills_section"),
                    "Candidate Profile"
                ),
                "evidence_text": item.get("evidence_text") or "Detected in candidate profile.",
                "project_name": item.get("project_name"),
                "similarity_score": item.get("similarity_score"),
                "requirement_type": item.get("requirement_type", "required"),
            })

        # Sort by confidence weight descending (strongest evidence first)
        evidence_provenance.sort(key=lambda x: x["confidence_weight"], reverse=True)

        # ── Gap Priority Matrix ──────────────────────────────────────────────
        gap_matrix: Dict[str, List[Dict]] = {"High": [], "Medium": [], "Low": []}

        for gap in match_data.get("missing_skills", []):
            canonical = gap.get("canonical_skill", "")
            req_type = gap.get("requirement_type", "preferred")
            priority = gap.get("priority", "Medium (Preferred)")

            if "High" in priority:
                tier = "High"
            elif "Medium" in priority:
                tier = "Medium"
            else:
                tier = "Low"

            gap_matrix[tier].append({
                "canonical_skill": canonical,
                "category": get_skill_category(canonical),
                "requirement_type": req_type,
                "priority": priority,
                "frequency_across_jobs": 1,
                "percentage_jobs_requiring": 100.0,
                "importance_reason": gap.get("importance_reason", ""),
                "suggested_action": SUGGESTED_ACTIONS.get(req_type, SUGGESTED_ACTIONS["preferred"]),
            })

        # ── Score Rationale ──────────────────────────────────────────────────
        score_rationale = _build_score_rationale(match_data)

        return {
            "candidate_id": candidate_id,
            "candidate_name": candidate_profile.get("name", "Candidate"),
            "job_id": job_id,
            "job_title": job.title if job else "Job Role",
            "company": job.company if job else "Confidential",
            "overall_fit_score": match_data.get("overall_fit_score", 0.0),
            "classification": match_data.get("classification", "FUTURE TARGET"),
            "score_rationale": score_rationale,
            "evidence_provenance": evidence_provenance,
            "gap_priority_matrix": gap_matrix,
            "total_matched": len(match_data.get("matched_skills", [])),
            "total_missing": len(match_data.get("missing_skills", [])),
        }

    def build_candidate_gap_summary(
        self,
        db: Session,
        candidate_id: int
    ) -> Dict[str, Any]:
        """
        Cross-job gap analytics: which skills block the most jobs,
        what are the candidate's consistent strengths.
        """
        candidate_profile = candidate_service.get_candidate_profile(db, candidate_id)
        all_results = db.query(MatchResult).filter(MatchResult.candidate_id == candidate_id).all()

        all_missing: List[str] = []
        all_matched: List[str] = []

        for result in all_results:
            if not result.breakdown_json:
                continue
            bd = json.loads(result.breakdown_json)
            all_missing.extend(m["canonical_skill"] for m in bd.get("missing_skills", []))
            all_matched.extend(m["canonical_skill"] for m in bd.get("matched_skills", []))

        total_jobs = len(all_results)
        missing_counts = Counter(all_missing)
        matched_counts = Counter(all_matched)

        # Skills that are consistently matched (strength skills)
        strength_skills = [
            skill for skill, count in matched_counts.most_common(10)
            if count >= max(1, total_jobs * 0.5)
        ]

        # Build global gap list
        global_gaps = []
        for skill, count in missing_counts.most_common(15):
            pct = round(count / max(total_jobs, 1) * 100, 0)
            req_type = "required" if pct >= 60 else "preferred"
            global_gaps.append({
                "canonical_skill": skill,
                "category": get_skill_category(skill),
                "requirement_type": req_type,
                "priority": "High (Required)" if pct >= 60 else "Medium (Preferred)",
                "frequency_across_jobs": count,
                "percentage_jobs_requiring": pct,
                "importance_reason": f"Missing in {count} of {total_jobs} evaluated jobs ({pct:.0f}%). Addressing this single gap directly improves alignment across multiple roles.",
                "suggested_action": SUGGESTED_ACTIONS.get(req_type, SUGGESTED_ACTIONS["preferred"]),
            })

        improvement_areas = list({get_skill_category(g["canonical_skill"]) for g in global_gaps[:8]})

        return {
            "candidate_id": candidate_id,
            "candidate_name": candidate_profile.get("name", "Candidate"),
            "target_role": candidate_profile.get("target_role"),
            "total_jobs_evaluated": total_jobs,
            "global_gaps": global_gaps,
            "strength_skills": strength_skills,
            "improvement_areas": improvement_areas,
        }


explainability_service = ExplainabilityService()

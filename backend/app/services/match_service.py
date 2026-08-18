import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.schema import MatchResult, Job, Candidate
from app.services.candidate_service import candidate_service
from app.services.jd_service import jd_service
from app.ml.matcher import embedding_matcher


class MatchService:
    """Service coordinating candidate evaluation against job descriptions and storing results."""

    def evaluate_candidate_job_match(
        self,
        db: Session,
        candidate_id: int,
        job_id: int
    ) -> Dict[str, Any]:
        """
        Evaluate candidate evidence against a single job description requirements profile.
        Stores match result in SQLite and returns full explainable breakdown.
        """
        candidate_profile = candidate_service.get_candidate_profile(db, candidate_id)
        job_requirements = jd_service.extract_and_store_requirements(db, job_id)
        job = db.query(Job).filter(Job.id == job_id).first()

        match_output = embedding_matcher.match_candidate_to_job(
            candidate_data=candidate_profile,
            job_requirements=job_requirements
        )

        # Upsert match result in SQLite
        existing_result = (
            db.query(MatchResult)
            .filter(
                MatchResult.candidate_id == candidate_id,
                MatchResult.job_id == job_id
            )
            .first()
        )

        breakdown_json_str = json.dumps(match_output, default=str)

        if existing_result:
            existing_result.score = match_output["overall_fit_score"]
            existing_result.classification = match_output["classification"]
            existing_result.breakdown_json = breakdown_json_str
            existing_result.created_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_result)
        else:
            new_result = MatchResult(
                candidate_id=candidate_id,
                job_id=job_id,
                score=match_output["overall_fit_score"],
                classification=match_output["classification"],
                breakdown_json=breakdown_json_str,
                created_at=datetime.utcnow(),
            )
            db.add(new_result)
            db.commit()
            db.refresh(new_result)

        return {
            "job_id": job_id,
            "candidate_id": candidate_id,
            "job_title": job.title if job else "Job Role",
            "company": job.company if job else "Confidential",
            "location": job.location if job else "UK",
            "overall_fit_score": match_output["overall_fit_score"],
            "classification": match_output["classification"],
            "matched_skills": match_output["matched_skills"],
            "missing_skills": match_output["missing_skills"],
            "score_breakdown": match_output["score_breakdown"],
            "created_at": datetime.utcnow(),
        }

    def evaluate_batch_jobs(
        self,
        db: Session,
        candidate_id: int,
        job_ids: Optional[List[int]] = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluate active candidate against multiple jobs or all jobs currently in SQLite.
        """
        if not job_ids:
            # Query all jobs stored in database
            all_jobs = db.query(Job).limit(30).all()
            job_ids = [j.id for j in all_jobs]

        results = []
        for jid in job_ids:
            try:
                res = self.evaluate_candidate_job_match(db, candidate_id, jid)
                results.append(res)
            except Exception as e:
                print(f"[MatchService] Error evaluating job {jid}: {e}")

        # Sort descending by overall fit score
        results.sort(key=lambda x: x["overall_fit_score"], reverse=True)
        return results


match_service = MatchService()

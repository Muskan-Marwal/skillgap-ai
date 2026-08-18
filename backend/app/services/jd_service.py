from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.schema import Job, JobRequirement, Skill
from app.parsers.jd_parser import jd_parser
from app.ml.esco_skills import get_all_canonical_skills, get_skill_category


class JobDescriptionService:
    """Service managing JD extraction, caching requirements in SQLite, and ESCO taxonomy."""

    def extract_and_store_requirements(self, db: Session, job_id: int) -> Dict[str, Any]:
        """
        Parse a job's description from the database, extract requirements, and persist them.
        If requirements already exist in SQLite, returns the structured profile.
        """
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise ValueError(f"Job with ID {job_id} does not exist.")

        # Check if already parsed in database
        existing_reqs = (
            db.query(JobRequirement)
            .filter(JobRequirement.job_id == job_id)
            .all()
        )

        if not existing_reqs:
            # Parse the actual JD text
            parsed_data = jd_parser.parse_job_description(job.description)

            # Persist each requirement to the database
            for req in parsed_data["all_extracted_skills"]:
                new_req = JobRequirement(
                    job_id=job.id,
                    canonical_skill=req["canonical_skill"],
                    requirement_type=req["requirement_type"],
                    raw_text=req.get("evidence_clause", ""),
                    confidence=req.get("confidence", 1.0),
                )
                db.add(new_req)

            db.commit()

            # Format and return profile
            return {
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company or "Confidential",
                "total_skills_extracted": parsed_data["total_skills_extracted"],
                "experience_years_required": parsed_data["experience_years_required"],
                "education_required": parsed_data["education_required"],
                "required_skills": parsed_data["required_skills"],
                "preferred_skills": parsed_data["preferred_skills"],
                "bonus_skills": parsed_data["bonus_skills"],
            }
        else:
            # Reconstruct profile from SQLite stored requirements
            required_list = []
            preferred_list = []
            bonus_list = []

            for r in existing_reqs:
                item = {
                    "canonical_skill": r.canonical_skill,
                    "category": get_skill_category(r.canonical_skill),
                    "requirement_type": r.requirement_type,
                    "evidence_clause": r.raw_text or "",
                    "confidence": r.confidence or 1.0,
                }
                if r.requirement_type == "required":
                    required_list.append(item)
                elif r.requirement_type == "preferred":
                    preferred_list.append(item)
                else:
                    bonus_list.append(item)

            exp_years = jd_parser.extract_experience_years(job.description)
            edu_level = jd_parser.extract_education(job.description)

            return {
                "job_id": job.id,
                "job_title": job.title,
                "company": job.company or "Confidential",
                "total_skills_extracted": len(existing_reqs),
                "experience_years_required": exp_years,
                "education_required": edu_level,
                "required_skills": required_list,
                "preferred_skills": preferred_list,
                "bonus_skills": bonus_list,
            }

    def get_canonical_taxonomy(self) -> Dict[str, Any]:
        """Return all ESCO canonical skills grouped by domain category."""
        skills = get_all_canonical_skills()
        categories = sorted(list(set(s["category"] for s in skills)))
        return {
            "total_skills": len(skills),
            "categories": categories,
            "skills": skills,
        }


jd_service = JobDescriptionService()

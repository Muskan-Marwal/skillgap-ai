from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from app.models.schema import Job
from app.services.adzuna import adzuna_client


class JobService:
    """Service managing job search, synchronization with Adzuna, and SQLite persistence."""

    def search_jobs(
        self,
        db: Session,
        query: str,
        location: str = "",
        country: str = "gb",
        page: int = 1,
        results_per_page: int = 15,
        use_cache_only: bool = False,
    ) -> Dict[str, Any]:
        """
        Search for jobs. Retrieves live listings from Adzuna (and caches them), or queries SQLite cache.
        """
        # If cache-only requested, search directly from local SQLite database
        if use_cache_only:
            return self._search_sqlite_cache(db, query, location, page, results_per_page)

        # 1. Fetch from Adzuna (or fallback seed)
        fetch_result = adzuna_client.fetch_jobs(
            query=query,
            location=location,
            country=country,
            page=page,
            results_per_page=results_per_page,
        )

        # 2. Persist/Upsert fetched jobs into SQLite
        db_jobs = []
        for job_dict in fetch_result["jobs"]:
            persisted_job = self._upsert_job(db, job_dict)
            db_jobs.append(persisted_job)

        # 3. Format and return
        return {
            "total_found": fetch_result["total_found"],
            "page": page,
            "country": country,
            "is_from_cache": fetch_result["is_from_cache"],
            "api_available": fetch_result["api_available"],
            "jobs": [
                {
                    "id": j.id,
                    "source_job_id": j.source_job_id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "description": j.description,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "original_url": j.original_url,
                    "created_date": j.created_date,
                    "is_cached": j.is_cached,
                    "retrieved_at": j.retrieved_at,
                }
                for j in db_jobs
            ],
        }

    def _upsert_job(self, db: Session, job_dict: Dict[str, Any]) -> Job:
        """Insert a new job or update an existing cached job by source_job_id."""
        existing_job = (
            db.query(Job)
            .filter(Job.source_job_id == job_dict["source_job_id"])
            .first()
        )

        if existing_job:
            existing_job.title = job_dict["title"]
            existing_job.company = job_dict["company"]
            existing_job.location = job_dict["location"]
            existing_job.description = job_dict["description"]
            existing_job.salary_min = job_dict.get("salary_min")
            existing_job.salary_max = job_dict.get("salary_max")
            existing_job.original_url = job_dict.get("original_url")
            existing_job.is_cached = True
            existing_job.retrieved_at = datetime.utcnow()
            db.commit()
            db.refresh(existing_job)
            return existing_job
        else:
            new_job = Job(
                source="adzuna",
                source_job_id=job_dict["source_job_id"],
                title=job_dict["title"],
                company=job_dict["company"],
                location=job_dict["location"],
                description=job_dict["description"],
                salary_min=job_dict.get("salary_min"),
                salary_max=job_dict.get("salary_max"),
                original_url=job_dict.get("original_url"),
                created_date=job_dict.get("created_date"),
                is_cached=True,
                retrieved_at=datetime.utcnow(),
            )
            db.add(new_job)
            db.commit()
            db.refresh(new_job)
            return new_job

    def _search_sqlite_cache(
        self,
        db: Session,
        query: str,
        location: str,
        page: int,
        results_per_page: int
    ) -> Dict[str, Any]:
        """Query jobs stored in SQLite database."""
        db_query = db.query(Job)

        if query:
            q_terms = query.split()
            filters = []
            for term in q_terms:
                like_str = f"%{term}%"
                filters.append(
                    or_(
                        Job.title.ilike(like_str),
                        Job.description.ilike(like_str),
                        Job.company.ilike(like_str),
                    )
                )
            db_query = db_query.filter(*filters)

        if location:
            db_query = db_query.filter(Job.location.ilike(f"%{location}%"))

        total_count = db_query.count()
        jobs = (
            db_query.order_by(desc(Job.retrieved_at))
            .offset((page - 1) * results_per_page)
            .limit(results_per_page)
            .all()
        )

        return {
            "total_found": total_count,
            "page": page,
            "country": "local-cache",
            "is_from_cache": True,
            "api_available": adzuna_client.is_configured(),
            "jobs": [
                {
                    "id": j.id,
                    "source_job_id": j.source_job_id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "description": j.description,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "original_url": j.original_url,
                    "created_date": j.created_date,
                    "is_cached": True,
                    "retrieved_at": j.retrieved_at,
                }
                for j in jobs
            ],
        }

    def get_job_by_id(self, db: Session, job_id: int) -> Optional[Job]:
        """Fetch a specific job by its primary key."""
        return db.query(Job).filter(Job.id == job_id).first()

    def get_cached_stats(self, db: Session) -> Dict[str, Any]:
        """Get summary statistics of cached jobs in SQLite."""
        total = db.query(Job).count()
        recent = db.query(Job).order_by(desc(Job.retrieved_at)).limit(5).all()
        
        # Unique role titles in cache
        roles = [r[0] for r in db.query(Job.title).distinct().limit(10).all()]

        return {
            "total_cached_jobs": total,
            "roles_cached": roles,
            "recent_jobs": [
                {
                    "id": j.id,
                    "source_job_id": j.source_job_id,
                    "title": j.title,
                    "company": j.company,
                    "location": j.location,
                    "description": j.description,
                    "salary_min": j.salary_min,
                    "salary_max": j.salary_max,
                    "original_url": j.original_url,
                    "created_date": j.created_date,
                    "is_cached": j.is_cached,
                    "retrieved_at": j.retrieved_at,
                }
                for j in recent
            ],
        }


job_service = JobService()

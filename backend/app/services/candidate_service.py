from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.models.schema import Candidate, Project, CandidateSkill
from app.parsers.resume_parser import resume_parser
from app.ml.esco_skills import get_skill_category


# Curated demo candidate presets for instant 1-click evaluation
DEMO_CANDIDATE_PRESETS = {
    "junior-data-scientist": {
        "name": "Alex Chen",
        "email": "alex.chen@example.com",
        "education": "B.Sc. in Computer Science & Statistics",
        "experience_years": 1.5,
        "target_role": "Data Scientist",
        "raw_text": """
ALEX CHEN
alex.chen@example.com | London, UK | GitHub: github.com/alexchen-ds

EDUCATION
B.Sc. in Computer Science & Statistics | University of London (2020 - 2023)

EXPERIENCE
Junior Machine Learning Intern | AI Insights Ltd (Jun 2023 - Dec 2023)
- Built predictive customer churn models in Python using Pandas, Scikit-learn, and XGBoost achieving 87% accuracy.
- Optimized SQL data extraction queries across PostgreSQL databases, reducing latency by 35%.
- Implemented exploratory data analysis and visualized distribution metrics using Matplotlib and Seaborn.

PROJECTS
Deep Learning NLP Sentiment Classifier (Personal Project)
- Developed an end-to-end sentiment classification API using PyTorch, Hugging Face transformers, and FastAPI.
- Containerized the microservice using Docker and deployed on AWS EC2.
- Utilized Git version control and wrote automated unit tests with Pytest.

E-Commerce Customer Segmentation (Academic Project)
- Applied K-Means clustering in Python with Scikit-learn on 500k+ customer transactions.
- Automated ETL pipeline using Python scripts and SQLite database storage.

TECHNICAL SKILLS
Languages: Python, SQL
Libraries: Pandas, NumPy, Scikit-learn, PyTorch, XGBoost
Tools: Git, Docker, FastAPI, PostgreSQL, Linux
""",
    },
    "python-backend-dev": {
        "name": "Sarah Jenkins",
        "email": "sarah.j@example.com",
        "education": "B.Tech in Information Technology",
        "experience_years": 2.5,
        "target_role": "Python Developer",
        "raw_text": """
SARAH JENKINS
sarah.j@example.com | Manchester, UK

EDUCATION
B.Tech in Information Technology (2019 - 2023)

EXPERIENCE
Software Engineer | CloudScale Systems (2023 - Present)
- Engineered high-throughput RESTful APIs using Python, FastAPI, and PostgreSQL.
- Implemented Redis caching layers reducing database query load by 45%.
- Designed automated CI/CD deployment pipelines using GitHub Actions and Docker.

PROJECTS
Real-Time Task Management System
- Developed full-stack web application using FastAPI, React, Tailwind CSS, and WebSockets.
- Configured AWS S3 bucket storage for media attachments.

TECHNICAL SKILLS
Python, FastAPI, Django, PostgreSQL, Redis, Docker, Git, CI/CD, React, JavaScript
""",
    }
}


class CandidateService:
    """Service managing candidate resume ingestion, database storage, and evidence graphs."""

    def create_candidate_from_parsed(self, db: Session, parsed_data: Dict[str, Any]) -> Candidate:
        """Create and persist Candidate, Project, and CandidateSkill records in SQLite."""
        new_candidate = Candidate(
            name=parsed_data["name"],
            email=parsed_data.get("email"),
            education=parsed_data.get("education"),
            experience_years=parsed_data.get("experience_years", 0.0),
            target_role=parsed_data.get("target_role"),
            raw_resume_text=parsed_data.get("raw_text"),
        )
        db.add(new_candidate)
        db.commit()
        db.refresh(new_candidate)

        # Persist Projects
        for proj in parsed_data.get("projects", []):
            new_proj = Project(
                candidate_id=new_candidate.id,
                name=proj["name"],
                description=proj.get("description", ""),
                technologies=", ".join(proj.get("technologies", [])),
            )
            db.add(new_proj)

        # Persist Candidate Skills with Evidence
        for skill in parsed_data.get("skills", []):
            new_skill = CandidateSkill(
                candidate_id=new_candidate.id,
                canonical_skill=skill["canonical_skill"],
                source=skill.get("source", "skills_section"),
                evidence_text=skill.get("evidence_text", ""),
                project_name=skill.get("project_name"),
                confidence=skill.get("confidence", 0.5),
            )
            db.add(new_skill)

        db.commit()
        db.refresh(new_candidate)
        return new_candidate

    def parse_and_store_pdf_resume(
        self,
        db: Session,
        pdf_bytes: bytes,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        """Extract text from PDF with PyMuPDF, parse evidence, and persist candidate."""
        raw_text = resume_parser.extract_text_from_pdf_bytes(pdf_bytes)
        parsed = resume_parser.parse_resume(raw_text, target_role=target_role)
        candidate = self.create_candidate_from_parsed(db, parsed)
        return self.get_candidate_profile(db, candidate.id)

    def load_demo_preset(self, db: Session, preset_id: str) -> Dict[str, Any]:
        """Load a realistic demo candidate preset for instant evaluation."""
        if preset_id not in DEMO_CANDIDATE_PRESETS:
            raise ValueError(f"Preset '{preset_id}' not found. Available: {list(DEMO_CANDIDATE_PRESETS.keys())}")

        preset = DEMO_CANDIDATE_PRESETS[preset_id]
        parsed = resume_parser.parse_resume(preset["raw_text"], target_role=preset["target_role"])
        parsed["name"] = preset["name"]
        parsed["email"] = preset["email"]
        parsed["education"] = preset["education"]
        parsed["experience_years"] = preset["experience_years"]

        candidate = self.create_candidate_from_parsed(db, parsed)
        return self.get_candidate_profile(db, candidate.id)

    def get_candidate_profile(self, db: Session, candidate_id: int) -> Dict[str, Any]:
        """Retrieve a candidate's structured profile and evidence graph from SQLite."""
        candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
        if not candidate:
            raise ValueError(f"Candidate with ID {candidate_id} not found.")

        skills = db.query(CandidateSkill).filter(CandidateSkill.candidate_id == candidate_id).all()
        projects = db.query(Project).filter(Project.candidate_id == candidate_id).all()

        skills_list = []
        grouped_evidence = {
            "experience": [],
            "project": [],
            "certification": [],
            "skills_section": [],
            "education": [],
        }

        for s in skills:
            item = {
                "id": s.id,
                "canonical_skill": s.canonical_skill,
                "category": get_skill_category(s.canonical_skill),
                "source": s.source,
                "evidence_text": s.evidence_text,
                "project_name": s.project_name,
                "confidence": s.confidence,
            }
            skills_list.append(item)
            if s.source in grouped_evidence:
                grouped_evidence[s.source].append(item)
            else:
                grouped_evidence["skills_section"].append(item)

        projects_list = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "technologies": p.technologies,
            }
            for p in projects
        ]

        return {
            "id": candidate.id,
            "name": candidate.name or "Candidate",
            "email": candidate.email,
            "education": candidate.education,
            "experience_years": candidate.experience_years,
            "location": candidate.location,
            "target_role": candidate.target_role,
            "total_skills_detected": len(skills_list),
            "skills_by_evidence": grouped_evidence,
            "skills": skills_list,
            "projects": projects_list,
            "created_at": candidate.created_at,
        }

    def list_recent_candidates(self, db: Session) -> List[Dict[str, Any]]:
        """List recently added candidates in SQLite."""
        candidates = db.query(Candidate).order_by(desc(Candidate.created_at)).limit(10).all()
        results = []
        for c in candidates:
            skills_count = db.query(CandidateSkill).filter(CandidateSkill.candidate_id == c.id).count()
            results.append({
                "id": c.id,
                "name": c.name,
                "target_role": c.target_role,
                "experience_years": c.experience_years,
                "total_skills": skills_count,
                "created_at": c.created_at,
            })
        return results


candidate_service = CandidateService()

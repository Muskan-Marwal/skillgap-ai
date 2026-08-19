import json
from typing import Dict, List, Any
from sqlalchemy.orm import Session
from app.models.schema import MatchResult, LearningResource
from app.services.explainability_service import explainability_service
from app.ml.esco_skills import get_skill_category

FREE_LEARNING_CATALOG: Dict[str, List[Dict[str, Any]]] = {
    "Python": [
        {"title": "Python for Everybody", "provider": "freeCodeCamp / Coursera", "url": "https://www.freecodecamp.org/learn/scientific-computing-with-python/", "level": "Beginner", "estimated_hours": 20, "description": "Complete Python programming course with projects."},
        {"title": "Python Official Tutorial", "provider": "Python.org", "url": "https://docs.python.org/3/tutorial/", "level": "Beginner", "estimated_hours": 10, "description": "Official Python language tutorial."},
    ],
    "Machine Learning": [
        {"title": "Machine Learning Crash Course", "provider": "Google", "url": "https://developers.google.com/machine-learning/crash-course", "level": "Beginner", "estimated_hours": 15, "description": "Google's fast-paced ML course with TensorFlow exercises."},
        {"title": "Intro to Machine Learning", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "level": "Beginner", "estimated_hours": 4, "description": "Hands-on ML fundamentals with real datasets."},
    ],
    "Deep Learning": [
        {"title": "Practical Deep Learning for Coders", "provider": "fast.ai", "url": "https://course.fast.ai/", "level": "Intermediate", "estimated_hours": 30, "description": "Top-down practical deep learning course."},
        {"title": "Intro to Deep Learning", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/intro-to-deep-learning", "level": "Beginner", "estimated_hours": 4, "description": "Neural networks basics with Keras."},
    ],
    "PyTorch": [
        {"title": "Learn PyTorch for Deep Learning", "provider": "PyTorch.org", "url": "https://pytorch.org/tutorials/beginner/basics/intro.html", "level": "Beginner", "estimated_hours": 12, "description": "Official PyTorch beginner tutorials."},
    ],
    "TensorFlow": [
        {"title": "TensorFlow Developer Certificate Prep", "provider": "Google / TensorFlow", "url": "https://www.tensorflow.org/learn", "level": "Intermediate", "estimated_hours": 20, "description": "Official TensorFlow learning path."},
    ],
    "Scikit-Learn": [
        {"title": "Scikit-Learn Tutorials", "provider": "Scikit-Learn.org", "url": "https://scikit-learn.org/stable/tutorial/index.html", "level": "Beginner", "estimated_hours": 8, "description": "Official scikit-learn documentation tutorials."},
    ],
    "Pandas": [
        {"title": "Pandas Course", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/pandas", "level": "Beginner", "estimated_hours": 4, "description": "Data manipulation with pandas on Kaggle."},
    ],
    "NumPy": [
        {"title": "NumPy Absolute Beginners Guide", "provider": "NumPy.org", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "level": "Beginner", "estimated_hours": 3, "description": "Official NumPy getting started guide."},
    ],
    "Natural Language Processing": [
        {"title": "NLP Course", "provider": "Hugging Face", "url": "https://huggingface.co/learn/nlp-course", "level": "Intermediate", "estimated_hours": 20, "description": "Complete NLP course using Transformers library."},
    ],
    "Computer Vision": [
        {"title": "Computer Vision Course", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/computer-vision", "level": "Intermediate", "estimated_hours": 4, "description": "CNN fundamentals and transfer learning."},
    ],
    "Hugging Face": [
        {"title": "Hugging Face Course", "provider": "Hugging Face", "url": "https://huggingface.co/learn", "level": "Intermediate", "estimated_hours": 15, "description": "Transformers, datasets, and model hub."},
    ],
    "Data Analysis": [
        {"title": "Data Analysis with Python", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/", "level": "Beginner", "estimated_hours": 15, "description": "Learn data analysis with NumPy, Pandas, Matplotlib."},
    ],
    "Data Visualization": [
        {"title": "Data Visualization Course", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/data-visualization", "level": "Beginner", "estimated_hours": 4, "description": "Seaborn-based visualization techniques."},
    ],
    "MLOps": [
        {"title": "MLOps Zoomcamp", "provider": "DataTalksClub", "url": "https://github.com/DataTalksClub/mlops-zoomcamp", "level": "Intermediate", "estimated_hours": 30, "description": "Free MLOps course: MLflow, deployment, monitoring."},
    ],
    "Statistics": [
        {"title": "Statistics and Probability", "provider": "Khan Academy", "url": "https://www.khanacademy.org/math/statistics-probability", "level": "Beginner", "estimated_hours": 20, "description": "Comprehensive statistics fundamentals."},
    ],
    "SQL": [
        {"title": "Intro to SQL", "provider": "Kaggle", "url": "https://www.kaggle.com/learn/intro-to-sql", "level": "Beginner", "estimated_hours": 3, "description": "SQL querying with BigQuery."},
        {"title": "SQL Tutorial", "provider": "W3Schools", "url": "https://www.w3schools.com/sql/", "level": "Beginner", "estimated_hours": 8, "description": "Interactive SQL fundamentals."},
    ],
    "PostgreSQL": [
        {"title": "PostgreSQL Tutorial", "provider": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "level": "Beginner", "estimated_hours": 10, "description": "Complete PostgreSQL learning path."},
    ],
    "MongoDB": [
        {"title": "MongoDB University", "provider": "MongoDB", "url": "https://learn.mongodb.com/", "level": "Beginner", "estimated_hours": 12, "description": "Free official MongoDB courses."},
    ],
    "ETL Pipelines": [
        {"title": "Data Engineering Zoomcamp", "provider": "DataTalksClub", "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp", "level": "Intermediate", "estimated_hours": 40, "description": "End-to-end data engineering with Airflow, dbt, Spark."},
    ],
    "FastAPI": [
        {"title": "FastAPI Official Tutorial", "provider": "FastAPI", "url": "https://fastapi.tiangolo.com/tutorial/", "level": "Beginner", "estimated_hours": 8, "description": "Official FastAPI step-by-step tutorial."},
    ],
    "Django": [
        {"title": "Django Official Tutorial", "provider": "Django Project", "url": "https://docs.djangoproject.com/en/5.0/intro/tutorial01/", "level": "Beginner", "estimated_hours": 10, "description": "Build a polls app from scratch."},
    ],
    "Flask": [
        {"title": "Flask Mega-Tutorial", "provider": "Miguel Grinberg", "url": "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world", "level": "Beginner", "estimated_hours": 15, "description": "Comprehensive Flask web app tutorial."},
    ],
    "RESTful APIs": [
        {"title": "REST API Tutorial", "provider": "restfulapi.net", "url": "https://restfulapi.net/", "level": "Beginner", "estimated_hours": 5, "description": "REST architecture principles and best practices."},
    ],
    "Node.js": [
        {"title": "Node.js Getting Started", "provider": "Node.js", "url": "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", "level": "Beginner", "estimated_hours": 8, "description": "Official Node.js learning path."},
    ],
    "JavaScript": [
        {"title": "JavaScript Algorithms & Data Structures", "provider": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/", "level": "Beginner", "estimated_hours": 30, "description": "Complete JavaScript course with certifications."},
    ],
    "TypeScript": [
        {"title": "TypeScript Handbook", "provider": "TypeScript", "url": "https://www.typescriptlang.org/docs/handbook/", "level": "Beginner", "estimated_hours": 10, "description": "Official TypeScript documentation."},
    ],
    "React": [
        {"title": "React Official Tutorial", "provider": "React.dev", "url": "https://react.dev/learn", "level": "Beginner", "estimated_hours": 12, "description": "Learn React from the official docs."},
    ],
    "Docker": [
        {"title": "Docker Getting Started", "provider": "Docker", "url": "https://docs.docker.com/get-started/", "level": "Beginner", "estimated_hours": 6, "description": "Official Docker containerization guide."},
    ],
    "Kubernetes": [
        {"title": "Kubernetes Basics", "provider": "Kubernetes.io", "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/", "level": "Intermediate", "estimated_hours": 10, "description": "Official interactive Kubernetes tutorial."},
    ],
    "AWS": [
        {"title": "AWS Cloud Practitioner Essentials", "provider": "AWS", "url": "https://explore.skillbuilder.aws/learn/course/external/view/elearning/134/aws-cloud-practitioner-essentials", "level": "Beginner", "estimated_hours": 6, "description": "Free AWS fundamentals course."},
    ],
    "Google Cloud Platform": [
        {"title": "Google Cloud Skills Boost", "provider": "Google Cloud", "url": "https://www.cloudskillsboost.google/", "level": "Beginner", "estimated_hours": 15, "description": "Free Google Cloud learning paths."},
    ],
    "Microsoft Azure": [
        {"title": "Azure Fundamentals", "provider": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/", "level": "Beginner", "estimated_hours": 10, "description": "Free Azure fundamentals learning path."},
    ],
    "CI/CD": [
        {"title": "GitHub Actions Documentation", "provider": "GitHub", "url": "https://docs.github.com/en/actions", "level": "Beginner", "estimated_hours": 6, "description": "Build CI/CD pipelines with GitHub Actions."},
    ],
    "Git": [
        {"title": "Git Tutorial", "provider": "Atlassian", "url": "https://www.atlassian.com/git/tutorials", "level": "Beginner", "estimated_hours": 5, "description": "Comprehensive Git version control tutorials."},
    ],
    "Linux": [
        {"title": "Linux Journey", "provider": "Linux Journey", "url": "https://linuxjourney.com/", "level": "Beginner", "estimated_hours": 10, "description": "Interactive Linux command line course."},
    ],
    "Automated Testing": [
        {"title": "Pytest Documentation", "provider": "Pytest", "url": "https://docs.pytest.org/en/stable/getting-started.html", "level": "Beginner", "estimated_hours": 5, "description": "Learn pytest for Python testing."},
    ],
    "Agile / Scrum": [
        {"title": "Agile Manifesto & Scrum Guide", "provider": "Scrum.org", "url": "https://www.scrum.org/resources/scrum-guide", "level": "Beginner", "estimated_hours": 3, "description": "Official Scrum framework guide."},
    ],
    "System Design": [
        {"title": "System Design Primer", "provider": "GitHub", "url": "https://github.com/donnemartin/system-design-primer", "level": "Intermediate", "estimated_hours": 20, "description": "Comprehensive system design study guide."},
    ],
    "XGBoost": [
        {"title": "XGBoost Documentation", "provider": "XGBoost", "url": "https://xgboost.readthedocs.io/en/stable/tutorials/index.html", "level": "Intermediate", "estimated_hours": 5, "description": "Official XGBoost tutorials."},
    ],
    "Apache Spark": [
        {"title": "Apache Spark Quick Start", "provider": "Apache Spark", "url": "https://spark.apache.org/docs/latest/quick-start.html", "level": "Intermediate", "estimated_hours": 10, "description": "Getting started with Apache Spark."},
    ],
    "A/B Testing": [
        {"title": "A/B Testing by Google", "provider": "Udacity", "url": "https://www.udacity.com/course/ab-testing--ud257", "level": "Intermediate", "estimated_hours": 10, "description": "Free A/B testing course by Google."},
    ],
    "Redis": [
        {"title": "Redis University", "provider": "Redis", "url": "https://university.redis.com/", "level": "Beginner", "estimated_hours": 6, "description": "Free official Redis courses."},
    ],
    "GraphQL": [
        {"title": "How to GraphQL", "provider": "Prisma", "url": "https://www.howtographql.com/", "level": "Beginner", "estimated_hours": 8, "description": "Full-stack GraphQL tutorial."},
    ],
}

PRIORITY_ORDER = {"High (Required)": 0, "Medium (Preferred)": 1, "Low (Bonus)": 2}


def _get_resources_for_skill(skill_name: str) -> List[Dict[str, Any]]:
    if skill_name in FREE_LEARNING_CATALOG:
        return FREE_LEARNING_CATALOG[skill_name]
    for cat_skill, resources in FREE_LEARNING_CATALOG.items():
        if cat_skill.lower() in skill_name.lower() or skill_name.lower() in cat_skill.lower():
            return resources
    return [
        {
            "title": f"Search: {skill_name} tutorial",
            "provider": "Web Search",
            "url": f"https://www.google.com/search?q={skill_name.replace(' ', '+')}+free+tutorial",
            "level": "Beginner",
            "estimated_hours": 5,
            "description": f"Find free learning resources for {skill_name}.",
        }
    ]


class RoadmapService:
    def build_job_roadmap(
        self, db: Session, candidate_id: int, job_id: int
    ) -> Dict[str, Any]:
        """Build a personalized learning roadmap for a specific job's gaps."""
        report = explainability_service.build_explainability_report(db, candidate_id, job_id)
        gap_matrix = report.get("gap_priority_matrix", {})

        roadmap_items = []
        week = 1
        total_hours = 0

        for priority_tier in ["High", "Medium", "Low"]:
            gaps = gap_matrix.get(priority_tier, [])
            for gap in gaps:
                skill = gap["canonical_skill"]
                resources = _get_resources_for_skill(skill)
                tier_hours = sum(r["estimated_hours"] for r in resources)
                total_hours += tier_hours

                roadmap_items.append({
                    "skill": skill,
                    "category": gap.get("category", get_skill_category(skill)),
                    "priority": gap["priority"],
                    "requirement_type": gap["requirement_type"],
                    "suggested_action": gap.get("suggested_action", ""),
                    "suggested_week": f"Week {week}",
                    "estimated_hours": tier_hours,
                    "resources": resources,
                })

                if priority_tier == "High":
                    week += 1
                elif len(gaps) > 1:
                    week += 0.5

            if gaps:
                week = max(week, int(week) + 1)

        return {
            "candidate_id": candidate_id,
            "candidate_name": report["candidate_name"],
            "job_id": job_id,
            "job_title": report["job_title"],
            "company": report.get("company"),
            "overall_fit_score": report["overall_fit_score"],
            "classification": report["classification"],
            "total_gaps": report["total_missing"],
            "total_estimated_hours": total_hours,
            "estimated_weeks": max(1, int(week)),
            "roadmap": roadmap_items,
            "score_rationale": report.get("score_rationale"),
        }

    def build_global_roadmap(
        self, db: Session, candidate_id: int
    ) -> Dict[str, Any]:
        """Build a cross-job learning roadmap based on all evaluated jobs."""
        summary = explainability_service.build_candidate_gap_summary(db, candidate_id)
        global_gaps = summary.get("global_gaps", [])

        roadmap_items = []
        week = 1
        total_hours = 0

        for gap in global_gaps:
            skill = gap["canonical_skill"]
            resources = _get_resources_for_skill(skill)
            tier_hours = sum(r["estimated_hours"] for r in resources)
            total_hours += tier_hours

            roadmap_items.append({
                "skill": skill,
                "category": gap.get("category", get_skill_category(skill)),
                "priority": gap["priority"],
                "requirement_type": gap["requirement_type"],
                "frequency_across_jobs": gap["frequency_across_jobs"],
                "percentage_jobs_requiring": gap["percentage_jobs_requiring"],
                "suggested_action": gap.get("suggested_action", ""),
                "suggested_week": f"Week {week}",
                "estimated_hours": tier_hours,
                "resources": resources,
            })

            if "High" in gap["priority"]:
                week += 1
            else:
                week += 0.5

        return {
            "candidate_id": candidate_id,
            "candidate_name": summary["candidate_name"],
            "target_role": summary.get("target_role"),
            "total_jobs_evaluated": summary["total_jobs_evaluated"],
            "total_gaps": len(global_gaps),
            "total_estimated_hours": total_hours,
            "estimated_weeks": max(1, int(week)),
            "strength_skills": summary.get("strength_skills", []),
            "improvement_areas": summary.get("improvement_areas", []),
            "roadmap": roadmap_items,
        }


roadmap_service = RoadmapService()

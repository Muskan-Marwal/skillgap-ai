import re
from typing import Dict, List, Optional, Set, Tuple

# Comprehensive Canonical Skills Taxonomy structured with ESCO metadata
# Category structure: Data & AI, Backend & System, Frontend & UI, Cloud & DevOps, Database & Storage, Software Engineering
ESCO_TAXONOMY: Dict[str, Dict[str, any]] = {
    # ------------------ Data, ML & AI ------------------
    "Python": {
        "category": "Programming Languages",
        "esco_id": "esco-skill-0001",
        "synonyms": ["python3", "python 3", "py"],
    },
    "Machine Learning": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0002",
        "synonyms": ["ml", "applied machine learning", "statistical learning"],
    },
    "Deep Learning": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0003",
        "synonyms": ["neural networks", "deep neural networks", "dl"],
    },
    "PyTorch": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0004",
        "synonyms": ["torch", "pytorch lightning"],
    },
    "TensorFlow": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0005",
        "synonyms": ["tf", "keras", "tensorflow 2"],
    },
    "Scikit-Learn": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0006",
        "synonyms": ["sklearn", "scikit learn", "scikitlearn"],
    },
    "Pandas": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0007",
        "synonyms": ["pandas dataframe", "pandas library"],
    },
    "NumPy": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0008",
        "synonyms": ["numpy arrays", "numpy library"],
    },
    "Natural Language Processing": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0009",
        "synonyms": ["nlp", "text processing", "text mining", "llm", "large language models", "transformers"],
    },
    "Computer Vision": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0010",
        "synonyms": ["cv", "image processing", "opencv"],
    },
    "Hugging Face": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0011",
        "synonyms": ["huggingface", "transformers library", "diffusers"],
    },
    "Data Analysis": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0012",
        "synonyms": ["eda", "exploratory data analysis", "data analytics"],
    },
    "Data Visualization": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0013",
        "synonyms": ["matplotlib", "seaborn", "plotly", "tableau", "power bi", "powerbi"],
    },
    "MLOps": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0014",
        "synonyms": ["mlops", "model deployment", "mlflow", "wandb", "weights and biases", "dvc"],
    },
    "A/B Testing": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0015",
        "synonyms": ["ab testing", "hypothesis testing", "experimentation"],
    },
    "Statistics": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0016",
        "synonyms": ["statistical modeling", "probability", "bayesian statistics", "regression analysis"],
    },
    "XGBoost": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0017",
        "synonyms": ["xgboost", "lightgbm", "catboost", "gradient boosting"],
    },
    "Apache Spark": {
        "category": "Data & AI",
        "esco_id": "esco-skill-0018",
        "synonyms": ["spark", "pyspark", "spark streaming", "databricks"],
    },

    # ------------------ Databases & Data Engineering ------------------
    "SQL": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0020",
        "synonyms": ["structured query language", "rdbms", "relational database", "sql queries"],
    },
    "PostgreSQL": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0021",
        "synonyms": ["postgres", "psql", "postgresql db"],
    },
    "MySQL": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0022",
        "synonyms": ["mysql database", "mariadb"],
    },
    "MongoDB": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0023",
        "synonyms": ["nosql", "mongo", "document database"],
    },
    "Redis": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0024",
        "synonyms": ["redis cache", "in-memory database"],
    },
    "Snowflake": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0025",
        "synonyms": ["snowflake data warehouse", "snowflake dw"],
    },
    "BigQuery": {
        "category": "Database & Storage",
        "esco_id": "esco-skill-0026",
        "synonyms": ["google bigquery", "bq"],
    },
    "ETL Pipelines": {
        "category": "Data Engineering",
        "esco_id": "esco-skill-0027",
        "synonyms": ["etl", "elt", "data pipeline", "data pipelines", "airflow", "apache airflow", "dbt"],
    },

    # ------------------ Backend & System ------------------
    "FastAPI": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0030",
        "synonyms": ["fastapi framework", "fast api", "asgi"],
    },
    "Django": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0031",
        "synonyms": ["django framework", "django rest framework", "drf"],
    },
    "Flask": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0032",
        "synonyms": ["flask microframework", "flask api"],
    },
    "RESTful APIs": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0033",
        "synonyms": ["rest api", "restful api", "rest apis", "restful web services", "api development"],
    },
    "GraphQL": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0034",
        "synonyms": ["graphql api", "apollo graphql"],
    },
    "Node.js": {
        "category": "Backend & API",
        "esco_id": "esco-skill-0035",
        "synonyms": ["nodejs", "node js", "express", "expressjs", "express.js"],
    },
    "Java": {
        "category": "Programming Languages",
        "esco_id": "esco-skill-0036",
        "synonyms": ["java 11", "java 17", "spring", "spring boot"],
    },
    "C++": {
        "category": "Programming Languages",
        "esco_id": "esco-skill-0037",
        "synonyms": ["cpp", "c plus plus", "c/c++"],
    },
    "Go": {
        "category": "Programming Languages",
        "esco_id": "esco-skill-0038",
        "synonyms": ["golang", "go language"],
    },
    "Rust": {
        "category": "Programming Languages",
        "esco_id": "esco-skill-0039",
        "synonyms": ["rust lang", "rust programming"],
    },

    # ------------------ Frontend & Web ------------------
    "JavaScript": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0040",
        "synonyms": ["js", "es6", "ecmascript"],
    },
    "TypeScript": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0041",
        "synonyms": ["ts", "typescript lang"],
    },
    "React": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0042",
        "synonyms": ["react.js", "reactjs", "react framework"],
    },
    "Next.js": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0043",
        "synonyms": ["nextjs", "next js", "react ssr"],
    },
    "Vue.js": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0044",
        "synonyms": ["vue", "vuejs", "vue 3", "nuxt"],
    },
    "HTML/CSS": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0045",
        "synonyms": ["html", "html5", "css", "css3", "sass", "scss"],
    },
    "Tailwind CSS": {
        "category": "Frontend & Web",
        "esco_id": "esco-skill-0046",
        "synonyms": ["tailwindcss", "tailwind", "utility-first css"],
    },

    # ------------------ Cloud, DevOps & Infrastructure ------------------
    "AWS": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0050",
        "synonyms": ["amazon web services", "amazon aws", "aws s3", "aws ec2", "aws lambda", "aws ecs", "s3"],
    },
    "Google Cloud Platform": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0051",
        "synonyms": ["gcp", "google cloud", "gcs"],
    },
    "Microsoft Azure": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0052",
        "synonyms": ["azure", "azure cloud", "azure devops"],
    },
    "Docker": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0053",
        "synonyms": ["docker containers", "docker compose", "containerization"],
    },
    "Kubernetes": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0054",
        "synonyms": ["k8s", "kubernetes cluster", "helm"],
    },
    "CI/CD": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0055",
        "synonyms": ["continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins"],
    },
    "Linux": {
        "category": "Cloud & DevOps",
        "esco_id": "esco-skill-0056",
        "synonyms": ["unix", "bash", "shell scripting", "ubuntu"],
    },

    # ------------------ Engineering Practices & Collaboration ------------------
    "Git": {
        "category": "Software Engineering",
        "esco_id": "esco-skill-0060",
        "synonyms": ["github", "gitlab", "version control", "git workflow"],
    },
    "Automated Testing": {
        "category": "Software Engineering",
        "esco_id": "esco-skill-0061",
        "synonyms": ["unit testing", "pytest", "jest", "test driven development", "tdd", "integration testing"],
    },
    "Agile / Scrum": {
        "category": "Software Engineering",
        "esco_id": "esco-skill-0062",
        "synonyms": ["agile methodology", "scrum", "kanban", "jira", "sprint planning"],
    },
    "System Design": {
        "category": "Software Engineering",
        "esco_id": "esco-skill-0063",
        "synonyms": ["software architecture", "microservices", "distributed systems", "high availability"],
    }
}


# Prebuild lookup tables for high-speed normalized resolution
SYNONYM_MAP: Dict[str, str] = {}
for canonical, meta in ESCO_TAXONOMY.items():
    # Map lowercase canonical
    SYNONYM_MAP[canonical.lower()] = canonical
    # Map all synonyms
    for syn in meta.get("synonyms", []):
        SYNONYM_MAP[syn.lower()] = canonical


def normalize_skill(skill_str: str) -> Optional[str]:
    """
    Given an arbitrary skill string, resolve it to its canonical ESCO standard name.
    Returns the canonical skill name if recognized, or cleaned capitalized string.
    """
    if not skill_str:
        return None
    
    clean = skill_str.strip().lower()
    # 1. Exact canonical or synonym match
    if clean in SYNONYM_MAP:
        return SYNONYM_MAP[clean]

    # 2. Word-boundary regex matching
    for syn_key, canonical in SYNONYM_MAP.items():
        pattern = r"\b" + re.escape(syn_key) + r"\b"
        if re.search(pattern, clean):
            return canonical

    # 3. Fallback: Title case if not in ontology
    return skill_str.strip().title()


def get_all_canonical_skills() -> List[Dict[str, any]]:
    """Return all canonical skills with their ESCO metadata."""
    results = []
    for canonical, meta in ESCO_TAXONOMY.items():
        results.append({
            "canonical_name": canonical,
            "category": meta["category"],
            "esco_id": meta["esco_id"],
            "synonyms": meta.get("synonyms", []),
        })
    return results


def get_skill_category(canonical_name: str) -> str:
    """Retrieve the high-level domain category for a canonical skill."""
    if canonical_name in ESCO_TAXONOMY:
        return ESCO_TAXONOMY[canonical_name].get("category", "General Tech")
    return "Technical Skill"

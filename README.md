# SkillGap AI
### AI-Based Skill Gap & Employment Recommendation System
SkillGap AI is an AI-powered employment intelligence platform that helps candidates understand **which jobs they are ready for, what skills they are missing, and what they should learn next**.

Instead of simply listing jobs, it connects a candidate's **resume, projects, skills and experience** with real job requirements and produces actionable employment and learning recommendations.


## 🚀 Features
- 📄 **Resume Analysis** — extracts skills, projects, experience and relevant evidence from PDF resumes.
- 💼 **Job Discovery** — discovers jobs through Adzuna and supports seeded demo job data.
- 🧠 **Job Description Analysis** — extracts and normalizes job requirements.
- 🎯 **AI Matching** — semantic + weighted matching using MiniLM embeddings.
- 🏆 **Job Recommendations**
  - 🟢 Apply Now
  - 🟡 Almost Ready
  - 🟣 Future Target
- 🔍 **Skill Gap Analysis** — identifies and prioritizes missing skills.
- 📚 **Learning Roadmap** — recommends free resources for identified gaps.
- 🔮 **What-If Simulation** — explores how learning additional skills can affect job matches.
- 🧩 **ESCO Skill Taxonomy** — standardizes skills across candidates and jobs.

## 🧠 How It Works

```text
Resume
  ↓
Skills + Projects + Evidence
  ↓
ESCO Skill Normalization
  ↓
Job Discovery (Adzuna)
  ↓
Job Requirement Analysis
  ↓
Semantic + Weighted Matching
  ↓
Job Recommendations
  ↓
Skill Gaps
  ↓
Learning Roadmap
  ↓
What-If Simulation
```

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy
- **Database:** SQLite
- **AI/NLP:** Sentence Transformers (all-MiniLM-L6-v2), semantic similarity, ESCO
- **Resume Processing:** PyMuPDF
- **Job Data:** Adzuna API

## 📁 Project Structure
```
skillgap-ai/
├── backend/
│   ├── app/
│   │   ├── api/                 # FastAPI endpoints
│   │   ├── core/                # Core configuration
│   │   ├── database/            # Database setup
│   │   ├── ml/                  # Matching & ESCO logic
│   │   │   ├── esco_skills.py
│   │   │   └── matcher.py
│   │   ├── models/              # Database models
│   │   ├── parsers/             # Resume & JD parsing
│   │   │   ├── jd_parser.py
│   │   │   └── resume_parser.py
│   │   ├── schemas/             # API/Pydantic schemas
│   │   └── services/            # Application/business logic
│   │       ├── adzuna.py
│   │       ├── candidate_service.py
│   │       ├── jd_service.py
│   │       ├── job_service.py
│   │       ├── match_service.py
│   │       ├── recommendation_service.py
│   │       ├── roadmap_service.py
│   │       └── whatif_service.py
│   ├── main.py
│   └── skillgap.db
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React UI components
│   │   │   ├── CandidateProfileView.jsx
│   │   │   ├── JDRequirementsView.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobDetailModal.jsx
│   │   │   ├── JobSearch.jsx
│   │   │   ├── MatchBreakdownModal.jsx
│   │   │   ├── MatchScoreBadge.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── RecommendationsDashboard.jsx
│   │   │   ├── ResumeUploader.jsx
│   │   │   ├── SkillGapView.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── WhatIfSimulator.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

## ⚙️ Setup
**Prerequisites**
- Python 3.12+
- Node.js + npm
- Git
- Adzuna API credentials *(optional for demo data; required for live job discovery)*

## 🌱 Demo Data
The project includes seeded demo data for testing and demonstration.
It provides sample candidates, skills, jobs, companies and matching data so the main features can be explored without manually entering everything.
The system can also use the Adzuna API for live job discovery when valid API credentials are configured.
> Demo data is for prototype and demonstration purposes and does not represent live employment data.

1. Clone -
```
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd skillgap-ai
```
2. Open the project in vs code and run these commands in terminal to set up python environment- 
```
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
3. Create a `.env` file in the project root:
```env
DEBUG=True
APP_NAME=AI-Based Skill Gap & Employment Recommendation System

DATABASE_URL=sqlite:///./skillgap.db

ADZUNA_APP_ID=your_app_id
ADZUNA_APP_KEY=your_app_key
ADZUNA_COUNTRY=gb

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

WEIGHT_REQUIRED=0.60
WEIGHT_PREFERRED=0.25
WEIGHT_BONUS=0.10
WEIGHT_EXPERIENCE=0.05
```

**Get Adzuna credentials from** https://developer.adzuna.com/

4. Start backend:
```
cd backend
python -m uvicorn main:app --reload --port 8000

API: http://127.0.0.1:8000
Docs: http://127.0.0.1:8000/docs
```
5. Start frontend:
```
Open a new terminal:

cd frontend
npm install
npm run dev

Open: http://localhost:5173
```
## 👤 Usage
1. Upload a candidate resume.
2. Review extracted skills and evidence.
3. Discover relevant jobs.
4. Compare candidate skills with job requirements.
5. Explore Apply Now / Almost Ready / Future Target recommendations.
6. Review skill gaps.
7. Follow the personalized learning roadmap.
8. Use What-If to simulate the impact of learning additional skills.

## 🎯 The Idea
Traditional job portals answer:

"What jobs are available?"

SkillGap AI asks:

"Which jobs can I apply for now, what am I missing for the jobs I want, and what should I learn next?"

The system connects:

Current Skills → Real Job Demand → Skill Gaps → Learning → Better Opportunities

## 🔐 Security

Never commit .env or expose API credentials.

Use .env.example as the configuration template.

# SkillGap AI: AI-Based Skill Gap & Employment Recommendation System

An AI-powered local platform that parses resumes, retrieves real job descriptions from the Adzuna API, extracts job requirements, computes semantic similarity using `sentence-transformers/all-MiniLM-L6-v2`, categorizes jobs (*Apply Now*, *Almost Ready*, *Future Target*), maps missing skills to curated free learning roadmaps, and provides real-time "What-If" skill simulation.

---

## 🚀 Quickstart (Phase 1)

### 1. Backend Setup (FastAPI)
```bash
# Navigate to project root
cd C:\Users\Rajendra\.gemini\antigravity\scratch\skillgap-ai

# Create and activate Python virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
cd backend
python -m uvicorn main:app --reload --port 8000
```
Backend API will be running at: `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`)

---

### 2. Frontend Setup (React + Vite + Tailwind)
```bash
# Open a new terminal and navigate to frontend directory
cd C:\Users\Rajendra\.gemini\antigravity\scratch\skillgap-ai\frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be running at: `http://localhost:5173`

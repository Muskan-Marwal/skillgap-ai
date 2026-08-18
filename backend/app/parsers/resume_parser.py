import re
import io
import fitz  # PyMuPDF
from typing import Dict, List, Any, Optional, Tuple, Set
from app.ml.esco_skills import ESCO_TAXONOMY, SYNONYM_MAP, get_skill_category


class ResumeParser:
    """
    Local PDF resume parser extracting candidate metadata, project evidence,
    work experience, and canonical ESCO skills with confidence provenance.
    """

    SECTION_HEADERS = {
        "experience": [
            r"\b(?:work|professional|industry|relevant)\s+experience\b",
            r"\bemployment\s+history\b",
            r"\bwork\s+history\b",
            r"\binternships?\b",
        ],
        "projects": [
            r"\b(?:academic|personal|key|featured|technical)?\s*projects\b",
            r"\bportfolio\b",
        ],
        "skills": [
            r"\b(?:technical|core|key|professional)?\s*skills\b",
            r"\btechnologies\b",
            r"\btools\s+(?:&|and)\s+technologies\b",
            r"\btechnical\s+proficiencies\b",
        ],
        "education": [
            r"\beducation\b",
            r"\bacademic\s+(?:background|history|qualifications)\b",
            r"\buniversity\b",
        ],
        "certifications": [
            r"\bcertifications?\b",
            r"\bcourses?\b",
            r"\btraining\b",
            r"\blicenses?\b",
        ],
    }

    def __init__(self):
        # Precompile section header regexes
        self.header_patterns = {}
        for section, pats in self.SECTION_HEADERS.items():
            combined = "|".join(pats)
            self.header_patterns[section] = re.compile(f"^(?:[0-9.\\s]*)(?:{combined})[:\\s]*$", re.IGNORECASE)

    def extract_text_from_pdf_bytes(self, pdf_bytes: bytes) -> str:
        """Extract plain text from PDF bytes locally using PyMuPDF."""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            full_text = []
            for page in doc:
                text = page.get_text("text")
                if text:
                    full_text.append(text)
            doc.close()
            return "\n".join(full_text)
        except Exception as e:
            raise ValueError(f"Failed to parse PDF resume with PyMuPDF: {str(e)}")

    def _segment_sections(self, text: str) -> Dict[str, List[str]]:
        """Segment raw resume text into distinct sections."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        sections: Dict[str, List[str]] = {
            "header": [],
            "experience": [],
            "projects": [],
            "skills": [],
            "education": [],
            "certifications": [],
            "other": [],
        }

        current_sec = "header"
        header_lines_count = 0

        for line in lines:
            # Check if this line is a section header
            matched_sec = None
            for sec_name, pat in self.header_patterns.items():
                if pat.search(line) or (len(line) < 35 and any(h in line.lower() for h in [f"{sec_name}:", f"{sec_name}"])):
                    matched_sec = sec_name
                    break

            if matched_sec:
                current_sec = matched_sec
                continue

            if current_sec == "header":
                header_lines_count += 1
                if header_lines_count > 6:
                    current_sec = "other"

            sections[current_sec].append(line)

        return sections

    def extract_email(self, text: str) -> Optional[str]:
        """Extract candidate email using regex."""
        match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", text)
        return match.group(0) if match else None

    def extract_name(self, text: str, header_lines: List[str]) -> str:
        """Extract candidate name from header lines."""
        for line in header_lines[:4]:
            clean = re.sub(r"[^a-zA-Z\s]", "", line).strip()
            words = clean.split()
            # Names typically have 2 to 4 words and don't contain keywords like Resume / Curriculum
            if 2 <= len(words) <= 4 and not any(w.lower() in ["resume", "curriculum", "vitae", "profile", "contact"] for w in words):
                return clean.title()
        return "Candidate Profile"

    def extract_education_details(self, edu_lines: List[str], full_text: str) -> Optional[str]:
        """Extract highest education / degree title."""
        combined = " ".join(edu_lines) if edu_lines else full_text
        degrees = [
            (r"\bph\.?d\b", "PhD in Computer Science / STEM"),
            (r"\bmaster'?s(?:\s+degree)?\b|\bm\.?s\.?\b|\bm\.?sc\b|\bm\.?tech\b", "Master's in Computer Science / Data Science"),
            (r"\bbachelor'?s(?:\s+degree)?\b|\bb\.?s\.?\b|\bb\.?sc\b|\bb\.?tech\b|\bb\.?e\b", "Bachelor's in Computer Science / Engineering"),
        ]
        for pat, label in degrees:
            if re.search(pat, combined, re.IGNORECASE):
                return label
        return "Bachelor's Degree (STEM)"

    def extract_experience_years(self, exp_lines: List[str], full_text: str) -> float:
        """Extract total years of experience or compute from date ranges."""
        combined = " ".join(exp_lines) if exp_lines else full_text
        
        # Look for explicit years pattern (e.g. "3 years of experience", "2+ yrs")
        match = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?experience", combined, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                pass

        # Estimate from 4-digit years in experience section (e.g. 2021 - 2024)
        years = re.findall(r"\b(201\d|202\d)\b", combined)
        if len(years) >= 2:
            int_years = sorted([int(y) for y in set(years)])
            diff = int_years[-1] - int_years[0]
            return float(max(1.0, min(diff, 15.0)))

        return 1.0 if exp_lines else 0.0

    def _extract_skills_from_text(self, text: str) -> Set[str]:
        """Scan text and return matching canonical ESCO skills."""
        text_lower = text.lower()
        found = set()

        for syn_key, canonical_name in SYNONYM_MAP.items():
            if len(syn_key) <= 2:
                pattern = r"(?<!\w)" + re.escape(syn_key) + r"(?!\w)"
            else:
                pattern = r"\b" + re.escape(syn_key) + r"\b"

            if re.search(pattern, text_lower):
                found.add(canonical_name)

        return found

    def extract_projects(self, project_lines: List[str]) -> List[Dict[str, Any]]:
        """Extract distinct project entities with their verified technologies."""
        projects = []
        current_proj: Optional[Dict[str, Any]] = None

        for line in project_lines:
            # Bullet point or header heuristic
            is_bullet = line.startswith(("-", "•", "*", "–")) or len(line) > 80
            
            if not is_bullet and len(line) < 60 and not line.endswith("."):
                # Likely a Project Title
                if current_proj:
                    projects.append(current_proj)
                
                techs = list(self._extract_skills_from_text(line))
                current_proj = {
                    "name": line.strip(),
                    "description": "",
                    "technologies": techs,
                }
            else:
                # Project bullet point / description
                if not current_proj:
                    current_proj = {
                        "name": "Featured Project",
                        "description": "",
                        "technologies": [],
                    }
                current_proj["description"] += " " + line
                found_techs = self._extract_skills_from_text(line)
                current_proj["technologies"] = list(set(current_proj["technologies"]).union(found_techs))

        if current_proj:
            projects.append(current_proj)

        # Clean descriptions
        for p in projects:
            p["description"] = p["description"].strip()
            p["technologies_str"] = ", ".join(p["technologies"])

        return projects

    def parse_resume(self, raw_text: str, target_role: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse raw resume text into candidate profile, project evidence,
        and evidence-backed canonical skills.
        """
        sections = self._segment_sections(raw_text)
        
        name = self.extract_name(raw_text, sections["header"])
        email = self.extract_email(raw_text)
        education = self.extract_education_details(sections["education"], raw_text)
        exp_years = self.extract_experience_years(sections["experience"], raw_text)
        projects = self.extract_projects(sections["projects"])

        # Map candidate skills with Confidence & Evidence Provenance:
        # Experience: 1.0 > Projects: 0.85 > Certifications: 0.70 > Skills Section: 0.50 > Education: 0.40
        skill_evidence_map: Dict[str, Dict[str, Any]] = {}

        def record_skill(skill_name: str, source: str, confidence: float, evidence_clause: str, proj_name: Optional[str] = None):
            if skill_name in skill_evidence_map:
                # Keep highest confidence evidence
                if confidence > skill_evidence_map[skill_name]["confidence"]:
                    skill_evidence_map[skill_name] = {
                        "canonical_skill": skill_name,
                        "category": get_skill_category(skill_name),
                        "source": source,
                        "confidence": confidence,
                        "evidence_text": evidence_clause,
                        "project_name": proj_name,
                    }
            else:
                skill_evidence_map[skill_name] = {
                    "canonical_skill": skill_name,
                    "category": get_skill_category(skill_name),
                    "source": source,
                    "confidence": confidence,
                    "evidence_text": evidence_clause,
                    "project_name": proj_name,
                }

        # 1. Experience Evidence (Confidence 1.0)
        for line in sections["experience"]:
            matched = self._extract_skills_from_text(line)
            for s in matched:
                record_skill(s, "experience", 1.0, line, None)

        # 2. Project Evidence (Confidence 0.85)
        for proj in projects:
            p_name = proj["name"]
            # From description bullets
            matched_desc = self._extract_skills_from_text(proj["description"])
            for s in matched_desc:
                record_skill(s, "project", 0.85, proj["description"][:160] + "...", p_name)
            # From project title / tech stack tags
            for s in proj["technologies"]:
                record_skill(s, "project", 0.85, f"Used in project: {p_name}", p_name)

        # 3. Certifications Evidence (Confidence 0.70)
        for line in sections["certifications"]:
            matched = self._extract_skills_from_text(line)
            for s in matched:
                record_skill(s, "certification", 0.70, line, None)

        # 4. Explicit Skills Section (Confidence 0.50)
        for line in sections["skills"]:
            matched = self._extract_skills_from_text(line)
            for s in matched:
                record_skill(s, "skills_section", 0.50, f"Listed in skills section: {line}", None)

        # 5. Education Section (Confidence 0.40)
        for line in sections["education"]:
            matched = self._extract_skills_from_text(line)
            for s in matched:
                record_skill(s, "education", 0.40, line, None)

        # Fallback if no sections detected: parse full text
        if not skill_evidence_map:
            matched_all = self._extract_skills_from_text(raw_text)
            for s in matched_all:
                record_skill(s, "skills_section", 0.50, "Extracted from resume body", None)

        # Group by evidence strength
        grouped_evidence = {
            "experience": [s for s in skill_evidence_map.values() if s["source"] == "experience"],
            "project": [s for s in skill_evidence_map.values() if s["source"] == "project"],
            "certification": [s for s in skill_evidence_map.values() if s["source"] == "certification"],
            "skills_section": [s for s in skill_evidence_map.values() if s["source"] == "skills_section"],
            "education": [s for s in skill_evidence_map.values() if s["source"] == "education"],
        }

        return {
            "name": name,
            "email": email,
            "education": education,
            "experience_years": exp_years,
            "target_role": target_role or "Data Scientist / Software Engineer",
            "raw_text": raw_text,
            "projects": projects,
            "skills": list(skill_evidence_map.values()),
            "skills_by_evidence": grouped_evidence,
            "total_skills_detected": len(skill_evidence_map),
        }


resume_parser = ResumeParser()

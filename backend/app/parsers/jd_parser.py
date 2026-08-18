import re
from typing import List, Dict, Any, Optional, Set, Tuple
from app.ml.esco_skills import ESCO_TAXONOMY, SYNONYM_MAP, get_skill_category


class JobDescriptionParser:
    """
    Extracts structured requirements, canonical skills, experience years,
    and education from raw company job description text.
    """

    # Signal cues for classification
    REQUIRED_SIGNALS = [
        r"\bmust\b",
        r"\brequired\b",
        r"\brequirements?\b",
        r"\bessential\b",
        r"\bmandatory\b",
        r"\bneed(?:s|ed)?\b",
        r"\bqualifications?\b",
        r"\bproficiency in\b",
        r"\bstrong (?:knowledge|experience|understanding|skills?)\b",
        r"\bproven experience\b",
        r"\bminimum of\b",
        r"\bcore skills?\b",
    ]

    PREFERRED_SIGNALS = [
        r"\bpreferred\b",
        r"\bpreferences?\b",
        r"\bnice to have\b",
        r"\bplus\b",
        r"\bdesired\b",
        r"\bdesirable\b",
        r"\badvantageous\b",
        r"\bbeneficial\b",
        r"\bideal(?:ly)?\b",
    ]

    BONUS_SIGNALS = [
        r"\bbonus\b",
        r"\bgood to have\b",
        r"\bexposure to\b",
        r"\bfamiliar(?:ity)? with\b",
        r"\boptional\b",
        r"\bbonus points\b",
        r"\bwould be great\b",
    ]

    def __init__(self):
        # Pre-compile regex for performance
        self.req_patterns = [re.compile(p, re.IGNORECASE) for p in self.REQUIRED_SIGNALS]
        self.pref_patterns = [re.compile(p, re.IGNORECASE) for p in self.PREFERRED_SIGNALS]
        self.bonus_patterns = [re.compile(p, re.IGNORECASE) for p in self.BONUS_SIGNALS]

    def _split_into_clauses(self, text: str) -> List[str]:
        """Split text into distinct bullet points, sentences, or comma-separated clauses."""
        # Normalize bullet markers
        normalized = re.sub(r"[\r\n]+", "\n", text)
        normalized = re.sub(r"[•·●*–—]\s*", "\n", normalized)
        
        # Split by newlines first
        raw_lines = normalized.split("\n")
        clauses = []

        for line in raw_lines:
            line = line.strip()
            if not line:
                continue
            # Further split long lines by period or semicolon if they have multiple sentences
            sentences = re.split(r"(?<=[.!?])\s+", line)
            for s in sentences:
                s = s.strip()
                if len(s) > 5:
                    clauses.append(s)

        return clauses

    def _classify_requirement_type(self, clause: str, current_section: str = "required") -> str:
        """Classify clause as required, preferred, or bonus based on semantic cues."""
        clause_lower = clause.lower()

        # Check bonus signals first
        for pat in self.bonus_patterns:
            if pat.search(clause_lower):
                return "bonus"

        # Check preferred signals
        for pat in self.pref_patterns:
            if pat.search(clause_lower):
                return "preferred"

        # Check required signals
        for pat in self.req_patterns:
            if pat.search(clause_lower):
                return "required"

        # Inherit current section state
        return current_section

    def extract_experience_years(self, text: str) -> Optional[float]:
        """Extract minimum years of experience required (e.g. '3+ years', '2-5 years')."""
        exp_patterns = [
            r"(\d+(?:\.\d+)?)\s*\+?\s*(?:to|-)\s*\d+\s*(?:years?|yrs?)\s+(?:of\s+)?experience",
            r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:proven\s+|applied\s+|industry\s+)?experience",
            r"minimum\s+(?:of\s+)?(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
            r"at\s+least\s+(\d+(?:\.\d+)?)\s*(?:years?|yrs?)",
        ]
        
        for pat in exp_patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    pass
        return None

    def extract_education(self, text: str) -> Optional[str]:
        """Extract education/degree requirements."""
        edu_patterns = [
            (r"\bph\.?d\b", "PhD"),
            (r"\bmaster'?s(?:\s+degree)?\b|\bm\.?s\.?\b|\bm\.?sc\b|\bm\.?tech\b", "Master's Degree"),
            (r"\bbachelor'?s(?:\s+degree)?\b|\bb\.?s\.?\b|\bb\.?sc\b|\bb\.?tech\b|\bdegree in computer science\b", "Bachelor's Degree"),
            (r"\bdegree\s+in\s+stem\b|\bquantitative degree\b", "Degree in STEM / Quantitative Field"),
        ]

        for pat, label in edu_patterns:
            if re.search(pat, text, re.IGNORECASE):
                return label
        return None

    def parse_job_description(self, jd_text: str) -> Dict[str, Any]:
        """
        Parse raw JD text into a structured requirement profile with canonical ESCO skills.
        """
        clauses = self._split_into_clauses(jd_text)
        current_section = "required"
        
        extracted_skills: Dict[str, Dict[str, Any]] = {}
        all_requirements: List[Dict[str, Any]] = []

        # Iterate through clauses to detect section changes & extract skills
        for clause in clauses:
            clause_lower = clause.lower()

            # Section header detection
            if any(h in clause_lower for h in ["preferred qualification", "nice to have", "desired skill", "what we'd like to see"]):
                current_section = "preferred"
                continue
            elif any(h in clause_lower for h in ["bonus qualification", "bonus points", "optional skill"]):
                current_section = "bonus"
                continue
            elif any(h in clause_lower for h in ["requirement", "qualification", "what you need", "what you'll bring", "must have"]):
                current_section = "required"
                continue

            req_type = self._classify_requirement_type(clause, current_section)

            # Match against canonical taxonomy & synonyms
            found_skills_in_clause = set()

            for syn_key, canonical_name in SYNONYM_MAP.items():
                # Avoid short substring false positives (e.g. 'c', 'r', 'go' in isolation)
                if len(syn_key) <= 2:
                    pattern = r"(?<!\w)" + re.escape(syn_key) + r"(?!\w)"
                else:
                    pattern = r"\b" + re.escape(syn_key) + r"\b"

                if re.search(pattern, clause_lower):
                    found_skills_in_clause.add(canonical_name)

            for canonical_name in found_skills_in_clause:
                # Requirement priority precedence: required (1) > preferred (2) > bonus (3)
                priority_weights = {"required": 3, "preferred": 2, "bonus": 1}
                current_p = priority_weights.get(req_type, 1)

                if canonical_name in extracted_skills:
                    existing_type = extracted_skills[canonical_name]["requirement_type"]
                    existing_p = priority_weights.get(existing_type, 1)
                    # Upgrade priority if this clause has a higher requirement signal
                    if current_p > existing_p:
                        extracted_skills[canonical_name]["requirement_type"] = req_type
                        extracted_skills[canonical_name]["evidence_clause"] = clause
                else:
                    extracted_skills[canonical_name] = {
                        "canonical_skill": canonical_name,
                        "category": get_skill_category(canonical_name),
                        "requirement_type": req_type,
                        "evidence_clause": clause,
                        "confidence": 1.0 if req_type == "required" else 0.85,
                    }

                all_requirements.append({
                    "canonical_skill": canonical_name,
                    "requirement_type": req_type,
                    "raw_text": clause,
                    "confidence": 1.0,
                })

        # Group extracted skills by requirement type
        required_list = [s for s in extracted_skills.values() if s["requirement_type"] == "required"]
        preferred_list = [s for s in extracted_skills.values() if s["requirement_type"] == "preferred"]
        bonus_list = [s for s in extracted_skills.values() if s["requirement_type"] == "bonus"]

        exp_years = self.extract_experience_years(jd_text)
        edu_level = self.extract_education(jd_text)

        return {
            "total_skills_extracted": len(extracted_skills),
            "experience_years_required": exp_years,
            "education_required": edu_level,
            "required_skills": required_list,
            "preferred_skills": preferred_list,
            "bonus_skills": bonus_list,
            "all_extracted_skills": list(extracted_skills.values()),
            "raw_clauses_count": len(clauses),
        }


jd_parser = JobDescriptionParser()

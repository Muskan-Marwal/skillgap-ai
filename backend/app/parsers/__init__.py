"""Parsers package initialization."""
from app.parsers.jd_parser import jd_parser, JobDescriptionParser
from app.parsers.resume_parser import resume_parser, ResumeParser

__all__ = ["jd_parser", "JobDescriptionParser", "resume_parser", "ResumeParser"]

import React from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Code,
  CheckCircle2,
  Sparkles,
  Info,
  Calendar,
  FolderGit2,
  Award,
} from 'lucide-react';

export const CandidateProfileView = ({ candidate }) => {
  if (!candidate) return null;

  const {
    name,
    email,
    education,
    experience_years,
    target_role,
    total_skills_detected,
    skills_by_evidence = {},
    projects = [],
  } = candidate;

  const expSkills = skills_by_evidence.experience || [];
  const projSkills = skills_by_evidence.project || [];
  const certSkills = skills_by_evidence.certification || [];
  const explicitSkills = skills_by_evidence.skills_section || [];
  const eduSkills = skills_by_evidence.education || [];

  return (
    <div className="space-y-6">
      {/* Candidate Overview Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-600/20 text-sky-400 border border-sky-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">{name}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Parsed & Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Role: <strong className="text-sky-300">{target_role || 'Not specified'}</strong>
                {email && ` • ${email}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Experience</div>
              <div className="text-sm font-bold text-white mt-0.5">
                {experience_years > 0 ? `${experience_years} Years` : 'Entry / Intern'}
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Skills</div>
              <div className="text-sm font-bold text-sky-400 mt-0.5">
                {total_skills_detected} Mapped
              </div>
            </div>
          </div>
        </div>

        {/* Education Tag */}
        {education && (
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Highest Education: <strong className="text-white">{education}</strong></span>
          </div>
        )}
      </div>

      {/* Extracted Projects (Evidence Source) */}
      {projects.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-indigo-400" />
            Extracted Projects (Direct Skill Evidence)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white">{proj.name}</h5>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    Project
                  </span>
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                )}

                {proj.technologies && (
                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
                    <Code className="w-3.5 h-3.5 text-sky-400" />
                    <span>Technologies:</span>
                    <strong className="text-slate-200">{proj.technologies}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Grouped by Evidence Hierarchy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            Skills by Evidence Hierarchy & Provenance
          </h4>
          <span className="text-[10px] text-slate-500">
            Hierarchy: Experience (1.0) &gt; Projects (0.85) &gt; Certifications (0.7) &gt; Explicit (0.5)
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* 1. Experience Evidence */}
          {expSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Professional Experience Evidence (Weight: 1.0)
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold">{expSkills.length} Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {expSkills.map((s, idx) => (
                  <div
                    key={idx}
                    title={`Evidence: "${s.evidence_text}"`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-help"
                  >
                    <span>{s.canonical_skill}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">
                      1.0
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Project Evidence */}
          {projSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5" /> Project-Demonstrated Evidence (Weight: 0.85)
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold">{projSkills.length} Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {projSkills.map((s, idx) => (
                  <div
                    key={idx}
                    title={`Evidence: "${s.evidence_text}"`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-medium cursor-help"
                  >
                    <span>{s.canonical_skill}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 font-mono">
                      0.85
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Certifications Evidence */}
          {certSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Certifications & Courses (Weight: 0.70)
                </span>
                <span className="text-[10px] text-amber-500 font-semibold">{certSkills.length} Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {certSkills.map((s, idx) => (
                  <div
                    key={idx}
                    title={`Evidence: "${s.evidence_text}"`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-help"
                  >
                    <span>{s.canonical_skill}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 font-mono">
                      0.70
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Explicit Skills Section */}
          {explicitSkills.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Explicit Skills Section (Weight: 0.50)
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">{explicitSkills.length} Skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {explicitSkills.map((s, idx) => (
                  <div
                    key={idx}
                    title={`Evidence: "${s.evidence_text}"`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium cursor-help"
                  >
                    <span>{s.canonical_skill}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 font-mono">
                      0.50
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Hover over any skill badge to inspect the exact sentence/bullet point proving the candidate's skill.</span>
        </div>
      </div>
    </div>
  );
};

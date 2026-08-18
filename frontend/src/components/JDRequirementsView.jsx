import React from 'react';
import {
  CheckCircle,
  Clock,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  Layers,
  Tag,
  Info,
} from 'lucide-react';

export const JDRequirementsView = ({ requirements, loading }) => {
  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Sparkles className="w-6 h-6 text-sky-400 animate-spin" />
        <p className="text-xs">Extracting requirements & normalizing against ESCO...</p>
      </div>
    );
  }

  if (!requirements) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        Click "Extract Requirements" to analyze this company's JD.
      </div>
    );
  }

  const {
    required_skills = [],
    preferred_skills = [],
    bonus_skills = [],
    experience_years_required,
    education_required,
  } = requirements;

  return (
    <div className="space-y-5 text-sm">
      {/* Experience & Education Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience</div>
            <div className="text-xs font-semibold text-white truncate">
              {experience_years_required ? `${experience_years_required}+ Years Required` : 'Not explicitly specified'}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="overflow-hidden">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Education</div>
            <div className="text-xs font-semibold text-white truncate">
              {education_required || 'Not explicitly specified'}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Required Skills (Must-Have) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Required Skills ({required_skills.length})
          </h5>
          <span className="text-[10px] text-slate-500">Weight: 60%</span>
        </div>

        {required_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {required_skills.map((skill, idx) => (
              <div
                key={idx}
                title={`Evidence: "${skill.evidence_clause}"`}
                className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium hover:border-rose-500/50 transition cursor-help"
              >
                <span>{skill.canonical_skill}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950 text-rose-400">
                  {skill.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No hard requirements detected in text.</p>
        )}
      </div>

      {/* 2. Preferred Skills (Nice-to-Have) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Preferred Qualifications ({preferred_skills.length})
          </h5>
          <span className="text-[10px] text-slate-500">Weight: 25%</span>
        </div>

        {preferred_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {preferred_skills.map((skill, idx) => (
              <div
                key={idx}
                title={`Evidence: "${skill.evidence_clause}"`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium hover:border-amber-500/50 transition cursor-help"
              >
                <span>{skill.canonical_skill}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400">
                  {skill.category}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No secondary preferences detected.</p>
        )}
      </div>

      {/* 3. Bonus Skills */}
      {bonus_skills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              Bonus / Nice-To-Have ({bonus_skills.length})
            </h5>
            <span className="text-[10px] text-slate-500">Weight: 10%</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {bonus_skills.map((skill, idx) => (
              <div
                key={idx}
                title={`Evidence: "${skill.evidence_clause}"`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-medium hover:border-sky-500/50 transition cursor-help"
              >
                <span>{skill.canonical_skill}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-400">
                  {skill.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Hover over any skill badge to inspect the exact JD clause it was extracted from.</span>
      </div>
    </div>
  );
};

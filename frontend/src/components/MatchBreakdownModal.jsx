import React from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Award,
  Sliders,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';

export const MatchBreakdownModal = ({ matchResult, onClose }) => {
  if (!matchResult) return null;

  const {
    job_title,
    company,
    location,
    overall_fit_score,
    classification,
    matched_skills = [],
    missing_skills = [],
    score_breakdown = {},
  } = matchResult;

  const {
    required_coverage = 0,
    preferred_coverage = 0,
    bonus_coverage = 0,
    experience_fit = 0,
    weights_used = {},
  } = score_breakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Semantic Match Evaluation
              </span>
              <span className="text-xs text-slate-500 font-mono">all-MiniLM-L6-v2</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">{job_title}</h2>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{company || 'Confidential Employer'}</span>
              <span>•</span>
              <span>{location || 'UK'}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Top Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5 max-w-md">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Job-Fit Alignment Score
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                <span className={overall_fit_score >= 78 ? 'text-emerald-400' : overall_fit_score >= 52 ? 'text-amber-400' : 'text-purple-400'}>
                  {overall_fit_score}%
                </span>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-normal">
                  / 100% Fit
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                * Evaluated using sentence embeddings against company-specific requirements extracted from this actual JD.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-64">
              <MatchScoreBadge score={overall_fit_score} classification={classification} />
            </div>
          </div>

          {/* Disclaimer Alert */}
          <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong>Explainability Note:</strong> This score represents <em>Job-Fit Alignment with Extracted Requirements</em>, not hiring probability. A candidate with 84% fit satisfies key requirements, but employment depends on interviews and hiring manager evaluation.
            </div>
          </div>

          {/* Subscore Mathematical Metrics Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-400" /> Weighted Scoring Formula Breakdown
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Required Skills (60%)</div>
                <div className="text-lg font-bold text-rose-400">{required_coverage}%</div>
                <div className="text-[10px] text-slate-500">Core job requirements</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Preferred Skills (25%)</div>
                <div className="text-lg font-bold text-amber-400">{preferred_coverage}%</div>
                <div className="text-[10px] text-slate-500">Nice-to-have skills</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Bonus Skills (10%)</div>
                <div className="text-lg font-bold text-sky-400">{bonus_coverage}%</div>
                <div className="text-[10px] text-slate-500">Supplementary stack</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Experience Fit (5%)</div>
                <div className="text-lg font-bold text-emerald-400">{experience_fit}%</div>
                <div className="text-[10px] text-slate-500">Years compatibility</div>
              </div>
            </div>
          </div>

          {/* 1. Matched Skills (With Candidate Evidence) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Satisfied Requirements & Provenance ({matched_skills.length})
              </h4>
              <span className="text-[10px] text-slate-500">Supported by Candidate Evidence</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matched_skills.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {item.canonical_skill}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-500/20 font-mono">
                      {Math.round(item.similarity_score * 100)}% Sim
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                    <strong className="text-slate-400 font-medium">Evidence ({item.evidence_source}):</strong> "{item.evidence_text}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Missing Skills (Skill Gaps) */}
          {missing_skills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Missing Requirements / Gaps ({missing_skills.length})
                </h4>
                <span className="text-[10px] text-slate-500">To be addressed in Phase 7/8 Roadmap</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missing_skills.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        {item.canonical_skill}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.priority.includes('High')
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.importance_reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  Clock,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { getCandidateGapSummary, getGlobalRoadmap } from '../services/api';

const PriorityBadge = ({ priority }) => {
  const cfg = priority?.includes('High')
    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    : priority?.includes('Medium')
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-sky-500/10 text-sky-400 border-sky-500/20';
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${cfg}`}>
      {priority}
    </span>
  );
};

export const SkillGapView = ({ candidateId, candidateName }) => {
  const [gapSummary, setGapSummary] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState({});

  const fetchData = async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const [gapData, roadmapData] = await Promise.all([
        getCandidateGapSummary(candidateId),
        getGlobalRoadmap(candidateId),
      ]);
      setGapSummary(gapData);
      setRoadmap(roadmapData);
    } catch (err) {
      console.error('Failed to fetch gap/roadmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [candidateId]);

  const toggleSkill = (skill) =>
    setExpandedSkills((prev) => ({ ...prev, [skill]: !prev[skill] }));

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
        <p className="text-sm font-medium">Analyzing skill gaps & building learning roadmap...</p>
      </div>
    );
  }

  if (!gapSummary && !roadmap) {
    return (
      <div className="p-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
        <Target className="w-10 h-10 text-slate-600 mx-auto" />
        <p>Evaluate jobs first to generate skill gap analysis and learning roadmap.</p>
      </div>
    );
  }

  const totalGaps = gapSummary?.global_gaps?.length || 0;
  const strengths = gapSummary?.strength_skills || [];
  const totalHours = roadmap?.total_estimated_hours || 0;
  const estWeeks = roadmap?.estimated_weeks || 0;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jobs Evaluated</div>
          <div className="text-2xl font-extrabold text-white">{gapSummary?.total_jobs_evaluated || 0}</div>
          <div className="text-[10px] text-slate-500">Across all searches</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/20 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Skill Gaps
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{totalGaps}</div>
          <div className="text-[10px] text-slate-500">Recurring missing skills</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Strengths
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{strengths.length}</div>
          <div className="text-[10px] text-slate-500">Consistently matched</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Learning Time
          </div>
          <div className="text-2xl font-extrabold text-sky-400">{totalHours}h</div>
          <div className="text-[10px] text-slate-500">~{estWeeks} weeks estimated</div>
        </div>
      </div>

      {/* Strength Skills */}
      {strengths.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Your Strength Skills (Matched in 50%+ of Jobs)
          </h4>
          <div className="flex flex-wrap gap-2">
            {strengths.map((skill, i) => (
              <span
                key={i}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-300 font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gap + Roadmap Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            Personalized Learning Roadmap
          </h3>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Skills ordered by impact — closing high-priority gaps first will unlock the most job tiers.
          All resources below are <strong className="text-sky-300">100% free</strong>.
        </p>

        {roadmap?.roadmap?.map((item, idx) => {
          const isExpanded = expandedSkills[item.skill];
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden"
            >
              {/* Skill Header */}
              <button
                onClick={() => toggleSkill(item.skill)}
                className="w-full p-4 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition text-left"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{item.skill}</h4>
                      <PriorityBadge priority={item.priority} />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.estimated_hours}h
                      </span>
                      <span>{item.suggested_week}</span>
                      {item.frequency_across_jobs && (
                        <span className="text-rose-400">
                          Missing in {item.percentage_jobs_requiring}% of jobs
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded: Resources */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800 pt-3">
                  <p className="text-xs text-slate-400 italic">{item.suggested_action}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {item.resources?.map((res, ri) => (
                      <a
                        key={ri}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/30 transition space-y-1.5 block group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                            {res.title}
                          </h5>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0 mt-0.5" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="text-sky-400 font-medium">{res.provider}</span>
                          <span>•</span>
                          <span>{res.level}</span>
                          <span>•</span>
                          <span>{res.estimated_hours}h</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{res.description}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import {
  Building2,
  MapPin,
  Banknote,
  Calendar,
  ExternalLink,
  FileText,
  Database,
  Radio,
  Sparkles,
  Award,
} from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';

export const JobCard = ({
  job,
  onSelect,
  onEvaluateMatch,
  matchResult,
  matchLoading,
}) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary undisclosed';
    if (min && max) {
      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    }
    return `From £${(min || max).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/10 space-y-4">
      <div className="space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          {job.is_cached ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-3 h-3" /> SQLite Cached
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
              <Radio className="w-3 h-3 text-sky-400" /> Live Adzuna
            </span>
          )}

          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(job.created_date)}
          </span>
        </div>

        {/* Job Title & Company */}
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
            {job.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {job.company || 'Confidential Employer'}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.location || 'Remote / UK'}
            </span>
          </div>
        </div>

        {/* Compensation */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Banknote className="w-4 h-4" />
          <span>{formatSalary(job.salary_min, job.salary_max)}</span>
        </div>

        {/* Semantic Match Score Banner if Evaluated */}
        {matchResult && (
          <MatchScoreBadge
            score={matchResult.overall_fit_score}
            classification={matchResult.classification}
          />
        )}

        {/* Actual Company Job Description Snippet */}
        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 line-clamp-3">
          {job.description}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2">
          {matchResult ? (
            <button
              onClick={() => onEvaluateMatch(job)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold transition border border-emerald-500/30"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              Inspect Match ({matchResult.overall_fit_score}%)
            </button>
          ) : (
            <button
              onClick={() => onEvaluateMatch(job)}
              disabled={matchLoading}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-md shadow-sky-600/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {matchLoading ? 'Evaluating with MiniLM...' : 'Calculate Fit Score'}
            </button>
          )}

          {job.original_url && (
            <a
              href={job.original_url}
              target="_blank"
              rel="noopener noreferrer"
              title="View original posting on Adzuna"
              className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-medium"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <button
          onClick={() => onSelect(job)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition border border-slate-800"
        >
          <FileText className="w-3 h-3 text-sky-400" />
          View Raw JD & Extracted Requirements
        </button>
      </div>
    </div>
  );
};

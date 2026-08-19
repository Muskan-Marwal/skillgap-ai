import React, { useState } from 'react';
import {
  CheckCircle2,
  Zap,
  Clock,
  Building2,
  MapPin,
  Banknote,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { MatchScoreBadge } from './MatchScoreBadge';

const TIER_CONFIG = {
  'APPLY NOW': {
    icon: CheckCircle2,
    color: 'emerald',
    headerBg: 'bg-emerald-500/10 border-emerald-500/30',
    cardBorder: 'border-emerald-500/20 hover:border-emerald-400/40',
    iconColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  'ALMOST READY': {
    icon: Zap,
    color: 'amber',
    headerBg: 'bg-amber-500/10 border-amber-500/30',
    cardBorder: 'border-amber-500/20 hover:border-amber-400/40',
    iconColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  'FUTURE TARGET': {
    icon: Clock,
    color: 'purple',
    headerBg: 'bg-purple-500/10 border-purple-500/30',
    cardBorder: 'border-purple-500/20 hover:border-purple-400/40',
    iconColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
};

const JobRecommendationCard = ({ card, onViewBreakdown, tierName }) => {
  const [expanded, setExpanded] = useState(false);
  const config = TIER_CONFIG[tierName] || TIER_CONFIG['ALMOST READY'];

  const formatSalary = (min, max) => {
    if (!min && !max) return null;
    if (min && max) return `£${min.toLocaleString()} – £${max.toLocaleString()}`;
    return `From £${(min || max).toLocaleString()}`;
  };

  const salary = formatSalary(card.salary_min, card.salary_max);

  return (
    <div className={`rounded-2xl bg-slate-900/90 border transition-all duration-200 ${config.cardBorder} p-5 space-y-4`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-bold text-white truncate">{card.job_title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300 font-medium">
              <Building2 className="w-3 h-3" />
              {card.company || 'Confidential'}
            </span>
            {card.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {card.location}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right space-y-1.5">
          <div className={`text-lg font-extrabold ${
            card.overall_fit_score >= 78 ? 'text-emerald-400' :
            card.overall_fit_score >= 52 ? 'text-amber-400' : 'text-purple-400'
          }`}>
            {card.overall_fit_score}%
          </div>
          {salary && (
            <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 justify-end">
              <Banknote className="w-3 h-3" />{salary}
            </div>
          )}
        </div>
      </div>

      {/* Score progress bar */}
      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            card.overall_fit_score >= 78 ? 'bg-emerald-500' :
            card.overall_fit_score >= 52 ? 'bg-amber-500' : 'bg-purple-500'
          }`}
          style={{ width: `${card.overall_fit_score}%` }}
        />
      </div>

      {/* Tier reason */}
      <p className="text-xs text-slate-300 leading-relaxed">{card.tier_reason}</p>

      {/* Matched skills summary */}
      {card.matched_skills_summary?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.matched_skills_summary.map((skill, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
              ✓ {skill}
            </span>
          ))}
        </div>
      )}

      {/* Critical missing skills */}
      {card.critical_missing_skills?.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Critical gaps:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {card.critical_missing_skills.map((skill, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                ✗ {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Subscores (expandable) */}
      {expanded && card.score_breakdown && (
        <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[10px]">
          {[
            { label: 'Required (60%)', value: card.score_breakdown.required_coverage, color: 'text-rose-400' },
            { label: 'Preferred (25%)', value: card.score_breakdown.preferred_coverage, color: 'text-amber-400' },
            { label: 'Bonus (10%)', value: card.score_breakdown.bonus_coverage, color: 'text-sky-400' },
            { label: 'Experience (5%)', value: card.score_breakdown.experience_fit, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">{label}</span>
              <span className={`font-bold font-mono ${color}`}>{value ?? 0}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => onViewBreakdown(card.full_match_details)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
        >
          <Award className="w-3.5 h-3.5 text-sky-400" />
          View Match Breakdown
        </button>

        {card.original_url && (
          <a
            href={card.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="View original job posting"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 transition"
          title="Toggle score breakdown"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};


const TierSection = ({ tier, onViewBreakdown }) => {
  const config = TIER_CONFIG[tier.tier_name] || TIER_CONFIG['ALMOST READY'];
  const Icon = config.icon;

  if (tier.count === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${config.headerBg} space-y-3`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-slate-900 ${config.iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{tier.tier_name}</h3>
            <p className="text-[11px] text-slate-400">{tier.tier_description}</p>
          </div>
          <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 font-semibold">
            0 Jobs
          </span>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">
          No jobs currently match this tier. Run a batch evaluation or search for more roles.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border ${config.headerBg} space-y-4 p-5`}>
      {/* Tier header */}
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-slate-900/80 ${config.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-white tracking-tight">{tier.tier_name}</h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${config.badgeBg}`}>
              {tier.count} Job{tier.count !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">{tier.tier_description}</p>
        </div>
      </div>

      {/* Job cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tier.jobs.map((card, idx) => (
          <JobRecommendationCard
            key={`${card.job_id}-${idx}`}
            card={card}
            onViewBreakdown={onViewBreakdown}
            tierName={tier.tier_name}
          />
        ))}
      </div>
    </div>
  );
};


export const RecommendationsDashboard = ({ data, onViewBreakdown, loading }) => {
  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Sparkles className="w-8 h-8 text-sky-400 animate-pulse" />
        <p className="text-sm font-medium">Building tiered recommendations with MiniLM semantic scores...</p>
      </div>
    );
  }

  if (!data) return null;

  const { candidate_name, target_role, total_evaluated_jobs, average_fit_score, apply_now, almost_ready, future_target, top_recurring_gaps } = data;

  return (
    <div className="space-y-8">
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Evaluated</div>
          <div className="text-2xl font-extrabold text-white">{total_evaluated_jobs}</div>
          <div className="text-[10px] text-slate-500">Jobs across all tiers</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Fit</div>
          <div className={`text-2xl font-extrabold ${average_fit_score >= 78 ? 'text-emerald-400' : average_fit_score >= 52 ? 'text-amber-400' : 'text-purple-400'}`}>
            {average_fit_score}%
          </div>
          <div className="text-[10px] text-slate-500">Candidate alignment</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Apply Now
          </div>
          <div className="text-2xl font-extrabold text-emerald-400">{apply_now?.count || 0}</div>
          <div className="text-[10px] text-slate-500">≥78% strong matches</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Zap className="w-3 h-3" /> Almost Ready
          </div>
          <div className="text-2xl font-extrabold text-amber-400">{almost_ready?.count || 0}</div>
          <div className="text-[10px] text-slate-500">52–77% close matches</div>
        </div>
      </div>

      {/* Recurring Gaps Insight Bar */}
      {top_recurring_gaps?.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
          <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Top Recurring Skill Gaps Across All Evaluated Jobs
          </h4>
          <div className="flex flex-wrap gap-2">
            {top_recurring_gaps.map((gap, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/20 text-xs"
              >
                <span className="font-semibold text-white">{gap.skill}</span>
                <span className="text-rose-400 font-bold font-mono">
                  Missing in {gap.percentage}% of jobs
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            These skills appear most frequently in job requirements that your current evidence doesn't cover.
            Addressing them will unlock multiple tiers simultaneously.
          </p>
        </div>
      )}

      {/* Three Tier Sections */}
      {apply_now && <TierSection tier={apply_now} onViewBreakdown={onViewBreakdown} />}
      {almost_ready && <TierSection tier={almost_ready} onViewBreakdown={onViewBreakdown} />}
      {future_target && <TierSection tier={future_target} onViewBreakdown={onViewBreakdown} />}
    </div>
  );
};

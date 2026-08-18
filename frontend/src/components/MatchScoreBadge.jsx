import React from 'react';
import { Award, Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export const MatchScoreBadge = ({ score, classification, compact = false }) => {
  const getBadgeColors = () => {
    if (score >= 78) {
      return {
        bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        bar: 'bg-emerald-500',
        text: 'text-emerald-400',
        icon: CheckCircle2,
      };
    } else if (score >= 52) {
      return {
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        bar: 'bg-amber-500',
        text: 'text-amber-400',
        icon: Zap,
      };
    } else {
      return {
        bg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
        bar: 'bg-purple-500',
        text: 'text-purple-400',
        icon: Clock,
      };
    }
  };

  const style = getBadgeColors();
  const Icon = style.icon;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg}`}>
        <Icon className="w-3 h-3" />
        {score}% Match • {classification}
      </span>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${style.bg} space-y-1.5`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
          <Icon className="w-3.5 h-3.5" /> {classification}
        </span>
        <span className={`text-base font-extrabold ${style.text}`}>
          {score}%
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${style.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

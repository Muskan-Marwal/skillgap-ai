import React from 'react';

export const StatusBadge = ({ status, label }) => {
  const getStyle = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'in-progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'planned':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      {label}
    </span>
  );
};

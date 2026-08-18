import React, { useState, useEffect } from 'react';
import { JDRequirementsView } from './JDRequirementsView';
import { parseJobRequirements } from '../services/api';
import {
  X,
  Building2,
  MapPin,
  Banknote,
  ExternalLink,
  Database,
  Radio,
  FileCode,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Layers,
} from 'lucide-react';

export const JobDetailModal = ({ job, onClose }) => {
  if (!job) return null;

  const [requirements, setRequirements] = useState(null);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRequirements = async () => {
      setLoadingReqs(true);
      setError(null);
      try {
        const data = await parseJobRequirements(job.id);
        if (isMounted) setRequirements(data);
      } catch (err) {
        if (isMounted) setError('Failed to extract structured requirements from this JD.');
      } finally {
        if (isMounted) setLoadingReqs(false);
      }
    };

    fetchRequirements();
    return () => {
      isMounted = false;
    };
  }, [job.id]);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary undisclosed';
    if (min && max) {
      return `£${min.toLocaleString()} - £${max.toLocaleString()}`;
    }
    return `From £${(min || max).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {job.is_cached ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Database className="w-3 h-3" /> SQLite Persisted
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Radio className="w-3 h-3" /> Live Retrieved
                </span>
              )}
              <span className="text-xs text-slate-500">Source ID: {job.source_job_id}</span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">{job.title}</h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company || 'Confidential Employer'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location || 'Remote / UK'}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Banknote className="w-3.5 h-3.5" />
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Column Split View */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Raw Company Job Description (Source of Truth) */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-sky-400" /> 1. Actual Company JD (Source of Truth)
              </h4>
              <span className="text-[10px] text-slate-500">Unfiltered Text</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed text-xs whitespace-pre-wrap font-sans max-h-[420px] overflow-y-auto">
              {job.description}
            </div>

            <p className="text-[11px] text-slate-500">
              * Critical Rule: System never uses hardcoded job profiles. Requirements are dynamically extracted from this exact JD text.
            </p>
          </div>

          {/* Right Column: Structured Extracted Requirements */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-sky-400" /> 2. Extracted Requirements Profile
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
                ESCO Normalized
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 max-h-[420px] overflow-y-auto">
              {error ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              ) : (
                <JDRequirementsView
                  requirements={requirements}
                  loading={loadingReqs}
                />
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>
              {requirements?.total_skills_extracted || 0} Canonical Skills Mapped in SQLite
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>

            {job.original_url && (
              <a
                href={job.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition shadow-lg shadow-sky-600/30"
              >
                View Original Job <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

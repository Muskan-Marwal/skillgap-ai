import React, { useState } from 'react';
import {
  Beaker,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Target,
  ChevronDown,
  ChevronUp,
  Building2,
} from 'lucide-react';
import { simulateWhatIf, simulateWhatIfGlobal } from '../services/api';

const ClassBadge = ({ classification }) => {
  const cfg =
    classification === 'APPLY NOW'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : classification === 'ALMOST READY'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${cfg}`}>
      {classification}
    </span>
  );
};

export const WhatIfSimulator = ({ candidateId, candidateName, jobs }) => {
  const [skillInput, setSkillInput] = useState('');
  const [addedSkills, setAddedSkills] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [mode, setMode] = useState('single');
  const [result, setResult] = useState(null);
  const [globalResult, setGlobalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedJobs, setExpandedJobs] = useState({});

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !addedSkills.includes(trimmed)) {
      setAddedSkills([...addedSkills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setAddedSkills(addedSkills.filter((s) => s !== skill));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const runSimulation = async () => {
    if (addedSkills.length === 0) {
      setError('Add at least one skill to simulate.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setGlobalResult(null);

    try {
      if (mode === 'single') {
        if (!selectedJobId) {
          setError('Select a job to simulate against.');
          setLoading(false);
          return;
        }
        const res = await simulateWhatIf(candidateId, parseInt(selectedJobId), addedSkills);
        setResult(res);
      } else {
        const res = await simulateWhatIfGlobal(candidateId, addedSkills);
        setGlobalResult(res);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const availableJobs = jobs || [];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Beaker className="w-4 h-4 text-sky-400" />
          What-If Skill Simulator
        </h4>
        <p className="text-xs text-slate-400">
          Add skills you're learning or plan to learn, then see how your match scores would change across jobs.
        </p>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'single' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            Single Job
          </button>
          <button
            onClick={() => setMode('global')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              mode === 'global' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            All Evaluated Jobs
          </button>
        </div>

        {/* Job Selector (single mode) */}
        {mode === 'single' && (
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:border-sky-500 focus:outline-none"
          >
            <option value="">Select a job to simulate against...</option>
            {availableJobs.map((job) => (
              <option key={job.job_id || job.id} value={job.job_id || job.id}>
                {job.job_title || job.title} — {job.company || 'Confidential'}
              </option>
            ))}
          </select>
        )}

        {/* Skill Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a skill (e.g. Docker, TensorFlow, SQL)..."
            className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            onClick={addSkill}
            className="p-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Added Skills Tags */}
        {addedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {addedSkills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-medium"
              >
                + {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-white transition">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <p className="text-xs text-rose-400">{error}</p>}

        {/* Run Button */}
        <button
          onClick={runSimulation}
          disabled={loading || addedSkills.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-bold transition shadow-lg"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Running Simulation...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Run What-If Simulation
            </>
          )}
        </button>
      </div>

      {/* Single Job Result */}
      {result && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-sky-400" />
            Simulation Result: {result.job_title}
          </h4>

          {/* Score Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Original</div>
              <div className="text-2xl font-extrabold text-slate-300">{result.original_score}%</div>
              <ClassBadge classification={result.original_classification} />
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/20 text-center space-y-1 flex flex-col items-center justify-center">
              <ArrowRight className="w-5 h-5 text-sky-400" />
              <div className={`text-lg font-extrabold ${result.score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.score_delta >= 0 ? '+' : ''}{result.score_delta}%
              </div>
              {result.tier_changed && (
                <span className="text-[10px] text-emerald-400 font-bold">TIER UPGRADE!</span>
              )}
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/20 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Simulated</div>
              <div className={`text-2xl font-extrabold ${
                result.simulated_score >= 78 ? 'text-emerald-400' : result.simulated_score >= 52 ? 'text-amber-400' : 'text-purple-400'
              }`}>
                {result.simulated_score}%
              </div>
              <ClassBadge classification={result.simulated_classification} />
            </div>
          </div>

          {/* Gaps Closed */}
          {result.gaps_closed?.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Gaps Closed ({result.gaps_closed.length})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {result.gaps_closed.map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remaining Gaps */}
          {result.remaining_gaps?.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Remaining Gaps ({result.remaining_gap_count})
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {result.remaining_gaps.map((s, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Result */}
      {globalResult && (
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Global Simulation: {globalResult.total_jobs_simulated} Jobs
          </h4>

          {/* Global Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Avg Original</div>
              <div className="text-xl font-extrabold text-slate-300">{globalResult.average_original_score}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Avg Simulated</div>
              <div className="text-xl font-extrabold text-emerald-400">{globalResult.average_simulated_score}%</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-sky-500/20 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Avg Delta</div>
              <div className={`text-xl font-extrabold ${globalResult.average_score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {globalResult.average_score_delta >= 0 ? '+' : ''}{globalResult.average_score_delta}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/20 text-center space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Tier Upgrades</div>
              <div className="text-xl font-extrabold text-purple-400">{globalResult.tier_upgrades}</div>
            </div>
          </div>

          {/* Per-job results */}
          <div className="space-y-2">
            {globalResult.job_simulations?.map((sim, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 className="w-3 h-3 text-slate-500" />
                    <span className="font-bold text-white truncate">{sim.job_title}</span>
                    <span className="text-slate-500">{sim.company}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-slate-400 font-mono">{sim.original_score}%</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className={`font-bold font-mono ${
                    sim.simulated_score >= 78 ? 'text-emerald-400' : sim.simulated_score >= 52 ? 'text-amber-400' : 'text-purple-400'
                  }`}>
                    {sim.simulated_score}%
                  </span>
                  <span className={`font-bold ${sim.score_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({sim.score_delta >= 0 ? '+' : ''}{sim.score_delta})
                  </span>
                  {sim.tier_changed && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      UPGRADED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

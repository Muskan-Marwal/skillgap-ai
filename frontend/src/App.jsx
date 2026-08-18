import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatusBadge } from './components/StatusBadge';
import { checkHealth, getSystemInfo } from './services/api';
import {
  Layers,
  Database,
  Search,
  FileText,
  Sliders,
  Award,
  BookOpen,
  Zap,
  Check,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const phases = [
  { id: 1, title: 'Foundation & Setup', status: 'completed', desc: 'FastAPI + React Vite scaffold + SQLite DB connected' },
  { id: 2, title: 'Adzuna Job Discovery', status: 'planned', desc: 'Live Adzuna API integration + SQLite caching' },
  { id: 3, title: 'JD Intelligence', status: 'planned', desc: 'Requirement extractor (required/pref/bonus) & ESCO normalization' },
  { id: 4, title: 'Candidate Intelligence', status: 'planned', desc: 'PyMuPDF resume parser + project/experience evidence extractor' },
  { id: 5, title: 'Semantic Matching', status: 'planned', desc: 'all-MiniLM-L6-v2 embeddings + weighted fit scoring' },
  { id: 6, title: 'Tiered Recommendations', status: 'planned', desc: 'Apply Now / Almost Ready / Future Target tri-tier categorizer' },
  { id: 7, title: 'Explainability & Gaps', status: 'planned', desc: 'Matched evidence provenance & missing skill priority breakdown' },
  { id: 8, title: 'Personalized Roadmap', status: 'planned', desc: 'Curated free learning resources + prerequisite graph' },
  { id: 9, title: 'What-If Simulation', status: 'planned', desc: 'Virtual candidate skill additions & real-time recalculation' },
  { id: 10, title: 'Final Demo Integration', status: 'planned', desc: '5-minute seamless SIH/Hackathon presentation flow' },
];

export function App() {
  const [healthData, setHealthData] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, sysInfo] = await Promise.all([checkHealth(), getSystemInfo()]);
      setHealthData(health);
      setSystemInfo(sysInfo);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const isConnected = !!healthData && healthData.status === 'healthy';
  const isDbOk = !!healthData && healthData.database_connected;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar isBackendConnected={isConnected} isDbConnected={isDbOk} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Top Hero Banner */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> 100% Local AI & Privacy-Preserving
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Phase 1: Foundation Active
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              The full-stack foundation is operational. FastAPI is serving REST endpoints, SQLAlchemy has initialized 
              all 8 core database tables in SQLite, and React + Vite is connected through the API proxy.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm transition shadow-lg shadow-sky-600/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Pinging Backend...' : 'Refresh Status'}
            </button>
            {lastChecked && (
              <span className="text-xs text-slate-400">
                Last checked at: <strong className="text-slate-200">{lastChecked}</strong>
              </span>
            )}
          </div>
        </section>

        {/* Live System Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Server Status */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">API Server</span>
              <Cpu className="w-5 h-5 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {isConnected ? 'FastAPI 0.110.0' : 'Disconnected'}
            </div>
            <p className="text-xs text-slate-400">
              Endpoint: <code className="text-sky-300">http://127.0.0.1:8000/api</code>
            </p>
            <div className="pt-2">
              <StatusBadge
                status={isConnected ? 'completed' : 'in-progress'}
                label={isConnected ? 'Healthy & Listening' : 'Waiting for Uvicorn'}
              />
            </div>
          </div>

          {/* Card 2: Database Schema */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Database</span>
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              SQLite 8 Tables
            </div>
            <p className="text-xs text-slate-400">
              File: <code className="text-emerald-300">skillgap.db</code> (Jobs, Candidates, Evidence)
            </p>
            <div className="pt-2">
              <StatusBadge
                status={isDbOk ? 'completed' : 'in-progress'}
                label={isDbOk ? 'Tables Initialized' : 'DB Not Connected'}
              />
            </div>
          </div>

          {/* Card 3: ML Model Config */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ML Engine Config</span>
              <Sliders className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-lg font-bold text-white truncate">
              {systemInfo?.embedding_model || 'all-MiniLM-L6-v2'}
            </div>
            <p className="text-xs text-slate-400">
              Weights: Req 60% | Pref 25% | Bonus 10% | Exp 5%
            </p>
            <div className="pt-2">
              <StatusBadge status="completed" label="Local Inference Ready" />
            </div>
          </div>
        </div>

        {/* Live Healthcheck Raw Payload Viewer */}
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-400" /> Live Backend Health Response (`/api/health`)
            </h3>
            <span className="text-xs text-slate-500">JSON Payload</span>
          </div>

          {error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              <strong>Connection Error:</strong> {error}
              <div className="mt-2 text-xs text-rose-400">
                Ensure your FastAPI backend is running on <code>http://127.0.0.1:8000</code>.
              </div>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto">
              {JSON.stringify({ health: healthData, system: systemInfo }, null, 2)}
            </pre>
          )}
        </section>

        {/* 10-Phase Roadmap Interactive Tracker */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Project Roadmap & Milestone Tracker</h3>
              <p className="text-xs text-slate-400">
                Structured 10-phase execution plan for the 2-day Hackathon/SIH MVP
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Phase 1 of 10 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phases.map((phase) => (
              <div
                key={phase.id}
                className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                  phase.status === 'completed'
                    ? 'bg-slate-900/90 border-emerald-500/30'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      Phase {phase.id}
                    </span>
                    <h4 className="text-sm font-semibold text-white">{phase.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{phase.desc}</p>
                </div>

                <StatusBadge
                  status={phase.status}
                  label={phase.status === 'completed' ? 'Done' : 'Planned'}
                />
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        SkillGap AI • Senior Developer & AI/ML Architecture • Local MVP Mode
      </footer>
    </div>
  );
}

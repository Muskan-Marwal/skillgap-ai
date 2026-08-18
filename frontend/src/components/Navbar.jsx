import React from 'react';
import { Sparkles, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export const Navbar = ({ isBackendConnected, isDbConnected }) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              SkillGap AI
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium border border-sky-500/30">
                MVP Phase 1
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Employment Recommendation & Skill Gap Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <Server className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">FastAPI Backend:</span>
            {isBackendConnected ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-300">SQLite DB:</span>
            {isDbConnected ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" /> Inactive
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

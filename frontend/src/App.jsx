import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatusBadge } from './components/StatusBadge';
import { JobSearch } from './components/JobSearch';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { ResumeUploader } from './components/ResumeUploader';
import { CandidateProfileView } from './components/CandidateProfileView';
import { MatchBreakdownModal } from './components/MatchBreakdownModal';
import {
  checkHealth,
  getSystemInfo,
  searchJobs,
  getCachedStats,
  getCanonicalSkills,
  uploadResume,
  loadCandidatePreset,
  getRecentCandidates,
  evaluateJobMatch,
  evaluateBatchJobs,
} from './services/api';
import {
  Layers,
  Database,
  Search,
  Sliders,
  Zap,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Briefcase,
  Radio,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Sparkles,
  BookOpen,
  UserCheck,
  Award,
  Play,
} from 'lucide-react';

const phases = [
  { id: 1, title: 'Foundation & Setup', status: 'completed', desc: 'FastAPI + React Vite scaffold + SQLite DB connected' },
  { id: 2, title: 'Adzuna Job Discovery', status: 'completed', desc: 'Live Adzuna API integration + SQLite caching' },
  { id: 3, title: 'JD Intelligence', status: 'completed', desc: 'Requirement extractor (required/pref/bonus) & ESCO normalization' },
  { id: 4, title: 'Candidate Intelligence', status: 'completed', desc: 'PyMuPDF resume parser + project/experience evidence extractor' },
  { id: 5, title: 'Semantic Matching', status: 'completed', desc: 'all-MiniLM-L6-v2 embeddings + weighted fit scoring' },
  { id: 6, title: 'Tiered Recommendations', status: 'planned', desc: 'Apply Now / Almost Ready / Future Target tri-tier categorizer' },
  { id: 7, title: 'Explainability & Gaps', status: 'planned', desc: 'Matched evidence provenance & missing skill priority breakdown' },
  { id: 8, title: 'Personalized Roadmap', status: 'planned', desc: 'Curated free learning resources + prerequisite graph' },
  { id: 9, title: 'What-If Simulation', status: 'planned', desc: 'Virtual candidate skill additions & real-time recalculation' },
  { id: 10, title: 'Final Demo Integration', status: 'planned', desc: '5-minute seamless SIH/Hackathon presentation flow' },
];

export function App() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'candidate' | 'jobs' | 'esco' | 'system'
  const [healthData, setHealthData] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [cachedStats, setCachedStats] = useState(null);
  const [canonicalTaxonomy, setCanonicalTaxonomy] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [jobsData, setJobsData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchesMap, setMatchesMap] = useState({}); // { jobId: MatchResult }
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [batchMatchingLoading, setBatchMatchingLoading] = useState(false);
  const [evaluatingJobId, setEvaluatingJobId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastSearchParams, setLastSearchParams] = useState({
    query: 'Data Scientist',
    location: 'London',
    country: 'gb',
    use_cache_only: false,
  });

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [health, sysInfo, stats, escoData, recents] = await Promise.all([
        checkHealth(),
        getSystemInfo(),
        getCachedStats().catch(() => null),
        getCanonicalSkills().catch(() => null),
        getRecentCandidates().catch(() => []),
      ]);
      setHealthData(health);
      setSystemInfo(sysInfo);
      setCachedStats(stats);
      setCanonicalTaxonomy(escoData);
      setRecentCandidates(recents || []);
      setError(null);
    } catch (err) {
      console.error('System Status Error:', err);
      setError(err.message || 'Could not connect to FastAPI server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file, targetRole) => {
    setCandidateLoading(true);
    setError(null);
    try {
      const profile = await uploadResume(file, targetRole);
      setCurrentCandidate(profile);
      setMatchesMap({}); // Reset matches for new candidate
      const recents = await getRecentCandidates().catch(() => []);
      setRecentCandidates(recents || []);
    } catch (err) {
      console.error('Resume Upload Error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to upload and parse resume.');
    } finally {
      setCandidateLoading(false);
    }
  };

  const handlePresetSelect = async (presetId) => {
    setCandidateLoading(true);
    setError(null);
    try {
      const profile = await loadCandidatePreset(presetId);
      setCurrentCandidate(profile);
      setMatchesMap({}); // Reset matches for new candidate
      const recents = await getRecentCandidates().catch(() => []);
      setRecentCandidates(recents || []);
    } catch (err) {
      console.error('Preset Load Error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load demo preset.');
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleSearch = async (params) => {
    setSearchLoading(true);
    setLastSearchParams(params);
    setError(null);
    try {
      const response = await searchJobs(params);
      setJobsData(response);
      const stats = await getCachedStats().catch(() => null);
      if (stats) setCachedStats(stats);
    } catch (err) {
      console.error('Job Search Error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to search jobs');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEvaluateSingleMatch = async (job) => {
    if (!currentCandidate) {
      setActiveTab('candidate');
      setError('Please select or upload a candidate first before evaluating fit score.');
      return;
    }

    // If already evaluated, open the breakdown modal directly
    if (matchesMap[job.id]) {
      setSelectedMatch(matchesMap[job.id]);
      return;
    }

    setEvaluatingJobId(job.id);
    try {
      const result = await evaluateJobMatch(currentCandidate.id, job.id);
      setMatchesMap((prev) => ({ ...prev, [job.id]: result }));
      setSelectedMatch(result);
    } catch (err) {
      console.error('Match error:', err);
      setError('Failed to calculate semantic fit score.');
    } finally {
      setEvaluatingJobId(null);
    }
  };

  const handleBatchEvaluate = async () => {
    if (!currentCandidate) {
      setActiveTab('candidate');
      setError('Please select or upload a candidate first.');
      return;
    }
    if (!jobsData?.jobs?.length) return;

    setBatchMatchingLoading(true);
    try {
      const jobIds = jobsData.jobs.map((j) => j.id);
      const results = await evaluateBatchJobs(currentCandidate.id, jobIds);
      const newMap = {};
      results.forEach((r) => {
        newMap[r.job_id] = r;
      });
      setMatchesMap((prev) => ({ ...prev, ...newMap }));
    } catch (err) {
      console.error('Batch match error:', err);
      setError('Failed to batch evaluate jobs.');
    } finally {
      setBatchMatchingLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    handlePresetSelect('junior-data-scientist');
    handleSearch({
      query: 'Data Scientist',
      location: 'London',
      country: 'gb',
      use_cache_only: false,
      results_per_page: 15,
      page: 1,
    });
  }, []);

  const isConnected = !!healthData && healthData.status === 'healthy';
  const isDbOk = !!healthData && healthData.database_connected;

  const filteredSkills = canonicalTaxonomy?.skills?.filter((s) =>
    selectedCategory === 'All' ? true : s.category === selectedCategory
  ) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar isBackendConnected={isConnected} isDbConnected={isDbOk} />

      {/* Main Tab Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-[73px] z-40 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-2 py-2">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'jobs'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              1. Job Discovery & Semantic Matching
            </button>

            <button
              onClick={() => setActiveTab('candidate')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'candidate'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              2. Candidate Resume Intelligence
              {currentCandidate && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('esco')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'esco'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              ESCO Taxonomy ({canonicalTaxonomy?.total_skills || 0})
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'system'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              System Status & 10-Phase Roadmap
            </button>
          </nav>

          {currentCandidate && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>
                Active: <strong className="text-white">{currentCandidate.name}</strong> ({currentCandidate.total_skills_detected} skills)
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Alert:</strong> {error}
            </div>
          </div>
        )}

        {/* TAB 1: JOB DISCOVERY & SEMANTIC MATCHING */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <FileSearch className="w-6 h-6 text-sky-400" />
                  Adzuna Job Discovery & Semantic Matching
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Local <code className="text-sky-300">all-MiniLM-L6-v2</code> embedding matcher evaluates candidate evidence against each company's actual JD.
                </p>
              </div>

              {/* Batch Match Action Button */}
              <div className="flex items-center gap-3">
                {currentCandidate && (
                  <button
                    onClick={handleBatchEvaluate}
                    disabled={batchMatchingLoading || searchLoading || !jobsData?.jobs?.length}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                  >
                    <Play className={`w-3.5 h-3.5 ${batchMatchingLoading ? 'animate-spin' : ''}`} />
                    {batchMatchingLoading ? 'Evaluating with MiniLM...' : `Batch Match All Jobs for ${currentCandidate.name}`}
                  </button>
                )}
              </div>
            </div>

            {/* Search Component */}
            <JobSearch onSearch={handleSearch} loading={searchLoading} />

            {/* Summary */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                Showing <strong className="text-white">{jobsData?.jobs?.length || 0}</strong> job postings for{' '}
                <strong className="text-sky-300">"{lastSearchParams.query}"</strong>
              </span>
              <span className="text-slate-500">
                Fit Score: Required (60%) + Preferred (25%) + Bonus (10%) + Experience (5%)
              </span>
            </div>

            {/* Jobs Grid */}
            {searchLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-sm font-medium">Fetching job descriptions & synchronizing cache...</p>
              </div>
            ) : jobsData?.jobs?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobsData.jobs.map((job) => (
                  <JobCard
                    key={job.source_job_id || job.id}
                    job={job}
                    onSelect={(j) => setSelectedJob(j)}
                    onEvaluateMatch={(j) => handleEvaluateSingleMatch(j)}
                    matchResult={matchesMap[job.id]}
                    matchLoading={evaluatingJobId === job.id}
                  />
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-semibold text-white">No jobs found</h4>
                <p className="text-xs">Try searching for a different role or removing location filters.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CANDIDATE RESUME INTELLIGENCE */}
        {activeTab === 'candidate' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-sky-400" />
                Candidate Resume Parser & Evidence Extractor
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Parses resume PDFs locally with PyMuPDF. Extracts candidate projects, experience details, and builds an evidence-backed skill graph.
              </p>
            </div>

            <ResumeUploader
              onUploadSuccess={handleResumeUpload}
              onPresetSelect={handlePresetSelect}
              loading={candidateLoading}
            />

            {candidateLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-sm font-medium">Extracting project evidence and mapping skills with PyMuPDF...</p>
              </div>
            ) : currentCandidate ? (
              <CandidateProfileView candidate={currentCandidate} />
            ) : null}
          </div>
        )}

        {/* TAB 3: ESCO TAXONOMY EXPLORER */}
        {activeTab === 'esco' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-sky-400" />
                ESCO Canonical Skills Taxonomy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Standardized European Skills/Competences taxonomy used for canonical normalization without conflating related skills.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === 'All'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                All Domains ({canonicalTaxonomy?.total_skills || 0})
              </button>
              {canonicalTaxonomy?.categories?.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{skill.canonical_name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">
                      {skill.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    ID: {skill.esco_id}
                  </div>
                  {skill.synonyms?.length > 0 && (
                    <div className="text-xs text-slate-500">
                      Aliases: {skill.synonyms.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM DIAGNOSTICS & 10-PHASE ROADMAP */}
        {activeTab === 'system' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">API Server</span>
                  <Cpu className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {isConnected ? 'FastAPI 0.110.0' : 'Disconnected'}
                </div>
                <p className="text-xs text-slate-400">
                  MiniLM Semantic Matcher: <strong className="text-emerald-400">Active & Cached</strong>
                </p>
                <div className="pt-2">
                  <StatusBadge
                    status={isConnected ? 'completed' : 'in-progress'}
                    label={isConnected ? 'Healthy & Online' : 'Waiting for Server'}
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">SQLite Database</span>
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {Object.keys(matchesMap).length} Matches Stored
                </div>
                <p className="text-xs text-slate-400">
                  File: <code className="text-emerald-300">skillgap.db</code> (Match Results & Cache)
                </p>
                <div className="pt-2">
                  <StatusBadge
                    status={isDbOk ? 'completed' : 'in-progress'}
                    label={isDbOk ? 'Database Connected' : 'DB Offline'}
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Matching Formula</span>
                  <Sliders className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-sm font-bold text-white">
                  Req 60% • Pref 25% • Bonus 10% • Exp 5%
                </div>
                <p className="text-xs text-slate-400">
                  Job-Fit Alignment Score (0.0 to 100.0%)
                </p>
                <div className="pt-2">
                  <StatusBadge status="completed" label="Cosine Similarity Matrix Active" />
                </div>
              </div>
            </div>

            {/* 10-Phase Roadmap Tracker */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Project Roadmap & Milestone Tracker</h3>
                  <p className="text-xs text-slate-400">
                    2-day Hackathon/SIH MVP execution status
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Phase 5 of 10 Completed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                      phase.id <= 5
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
                      status={phase.id <= 5 ? 'completed' : 'planned'}
                      label={phase.id <= 5 ? 'Done' : 'Planned'}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modal for Inspecting Full Company JD & Requirements Split View */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* Modal for Semantic Match Breakdown */}
      {selectedMatch && (
        <MatchBreakdownModal
          matchResult={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        SkillGap AI • Senior Developer & AI/ML Architecture • Local MiniLM-L6-v2 Semantic Matcher
      </footer>
    </div>
  );
}

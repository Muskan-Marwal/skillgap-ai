import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatusBadge } from './components/StatusBadge';
import { JobSearch } from './components/JobSearch';
import { JobCard } from './components/JobCard';
import { JobDetailModal } from './components/JobDetailModal';
import { ResumeUploader } from './components/ResumeUploader';
import { CandidateProfileView } from './components/CandidateProfileView';
import { MatchBreakdownModal } from './components/MatchBreakdownModal';
import { RecommendationsDashboard } from './components/RecommendationsDashboard';
import { SkillGapView } from './components/SkillGapView';
import { WhatIfSimulator } from './components/WhatIfSimulator';
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
  getRecommendationsDashboard,
  refreshRecommendationsDashboard,
} from './services/api';
import {
  Layers,
  Database,
  Sliders,
  RefreshCw,
  Cpu,
  Briefcase,
  Radio,
  AlertCircle,
  FileSearch,
  Sparkles,
  BookOpen,
  UserCheck,
  Award,
  Play,
  LayoutDashboard,
  CheckCircle2,
  Zap,
  Clock,
  Target,
  Beaker,
} from 'lucide-react';

const phases = [
  { id: 1, title: 'Foundation & Setup', status: 'completed', desc: 'FastAPI + React Vite scaffold + SQLite DB connected' },
  { id: 2, title: 'Adzuna Job Discovery', status: 'completed', desc: 'Live Adzuna API integration + SQLite caching' },
  { id: 3, title: 'JD Intelligence', status: 'completed', desc: 'Requirement extractor (required/pref/bonus) & ESCO normalization' },
  { id: 4, title: 'Candidate Intelligence', status: 'completed', desc: 'PyMuPDF resume parser + project/experience evidence extractor' },
  { id: 5, title: 'Semantic Matching', status: 'completed', desc: 'all-MiniLM-L6-v2 embeddings + weighted fit scoring' },
  { id: 6, title: 'Tiered Recommendations', status: 'completed', desc: 'Apply Now / Almost Ready / Future Target tri-tier dashboard' },
  { id: 7, title: 'Skill Gap Analysis', status: 'completed', desc: 'Cross-job gap analysis, evidence provenance & priority matrix' },
  { id: 8, title: 'Personalized Roadmap', status: 'completed', desc: 'Curated free learning resources + weekly learning plan' },
  { id: 9, title: 'What-If Simulation', status: 'completed', desc: 'Virtual skill additions & real-time score recalculation' },
  { id: 10, title: 'Final Integration', status: 'completed', desc: 'End-to-end workflow, testing, and hackathon polish' },
];

export function App() {
  const [activeTab, setActiveTab] = useState('recommendations');

  const [healthData, setHealthData] = useState(null);
  const [canonicalTaxonomy, setCanonicalTaxonomy] = useState(null);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [jobsData, setJobsData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchesMap, setMatchesMap] = useState({});
  const [recommendationsData, setRecommendationsData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [batchMatchingLoading, setBatchMatchingLoading] = useState(false);
  const [recsLoading, setRecsLoading] = useState(false);
  const [evaluatingJobId, setEvaluatingJobId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lastSearchQuery, setLastSearchQuery] = useState('Data Scientist');

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [health, escoData, recents] = await Promise.all([
        checkHealth(),
        getCanonicalSkills().catch(() => null),
        getRecentCandidates().catch(() => []),
      ]);
      setHealthData(health);
      setCanonicalTaxonomy(escoData);
      setRecentCandidates(recents || []);
      setError(null);
    } catch (err) {
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
      setMatchesMap({});
      setRecommendationsData(null);
      setRecentCandidates(await getRecentCandidates().catch(() => []));
    } catch (err) {
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
      setMatchesMap({});
      setRecommendationsData(null);
      setRecentCandidates(await getRecentCandidates().catch(() => []));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load demo preset.');
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleSearch = async (params) => {
    setSearchLoading(true);
    setLastSearchQuery(params.query || 'Jobs');
    setError(null);
    try {
      const response = await searchJobs(params);
      setJobsData(response);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to search jobs');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEvaluateSingleMatch = async (job) => {
    if (!currentCandidate) {
      setActiveTab('candidate');
      setError('Please select or upload a candidate first.');
      return;
    }
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
      setError('Failed to calculate fit score.');
    } finally {
      setEvaluatingJobId(null);
    }
  };

  const handleBatchEvaluate = async () => {
    if (!currentCandidate) { setActiveTab('candidate'); setError('Select a candidate first.'); return; }
    if (!jobsData?.jobs?.length) return;
    setBatchMatchingLoading(true);
    try {
      const jobIds = jobsData.jobs.map((j) => j.id);
      const results = await evaluateBatchJobs(currentCandidate.id, jobIds);
      const map = {};
      results.forEach((r) => { map[r.job_id] = r; });
      setMatchesMap((prev) => ({ ...prev, ...map }));
    } catch (err) {
      setError('Batch matching failed.');
    } finally {
      setBatchMatchingLoading(false);
    }
  };

  const handleBuildRecommendations = async () => {
    if (!currentCandidate) { setActiveTab('candidate'); setError('Select a candidate first.'); return; }
    setRecsLoading(true);
    setError(null);
    try {
      const data = await getRecommendationsDashboard(currentCandidate.id);
      setRecommendationsData(data);
      setActiveTab('recommendations');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to build recommendations.');
    } finally {
      setRecsLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    if (!currentCandidate) return;
    setRecsLoading(true);
    setError(null);
    try {
      const jobIds = jobsData?.jobs?.map((j) => j.id) || null;
      const data = await refreshRecommendationsDashboard(currentCandidate.id, jobIds);
      setRecommendationsData(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to refresh recommendations.');
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    handlePresetSelect('junior-data-scientist');
    handleSearch({ query: 'Data Scientist', location: 'London', country: 'gb', use_cache_only: false, results_per_page: 15, page: 1 });
  }, []);

  useEffect(() => {
    if (currentCandidate && jobsData?.jobs?.length && !recommendationsData) {
      handleBuildRecommendations();
    }
  }, [currentCandidate, jobsData]);

  const isConnected = !!healthData && healthData.status === 'healthy';
  const isDbOk = !!healthData && healthData.database_connected;
  const filteredSkills = canonicalTaxonomy?.skills?.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  ) || [];

  const allEvaluatedJobs = recommendationsData
    ? [
        ...(recommendationsData.apply_now?.jobs || []),
        ...(recommendationsData.almost_ready?.jobs || []),
        ...(recommendationsData.future_target?.jobs || []),
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar isBackendConnected={isConnected} isDbConnected={isDbOk} />

      {/* Tab Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-[73px] z-40 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1.5 py-2 flex-wrap gap-y-1">
            {[
              { id: 'recommendations', label: 'Recommendations', icon: LayoutDashboard },
              { id: 'jobs', label: 'Job Discovery', icon: FileSearch },
              { id: 'skillgap', label: 'Skill Gap & Roadmap', icon: Target },
              { id: 'whatif', label: 'What-If', icon: Beaker },
              { id: 'candidate', label: 'Candidate', icon: UserCheck },
              { id: 'esco', label: 'ESCO Taxonomy', icon: BookOpen },
              { id: 'system', label: 'System', icon: Cpu },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                  activeTab === id
                    ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {id === 'candidate' && currentCandidate && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </nav>

          {currentCandidate && (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 shrink-0">
              <UserCheck className="w-3 h-3 text-sky-400" />
              <strong className="text-white">{currentCandidate.name}</strong>
              <span>({currentCandidate.total_skills_detected} skills)</span>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div><strong>Alert:</strong> {error}</div>
          </div>
        )}

        {/* ── TAB: RECOMMENDATIONS DASHBOARD ─────────────────────────────── */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <LayoutDashboard className="w-6 h-6 text-sky-400" />
                  Tiered Employment Recommendation Dashboard
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Jobs ranked by MiniLM semantic fit score into <strong className="text-emerald-400">Apply Now</strong>,{' '}
                  <strong className="text-amber-400">Almost Ready</strong>, and{' '}
                  <strong className="text-purple-400">Future Target</strong> tiers.
                </p>
              </div>

              {currentCandidate && (
                <button
                  onClick={handleRefreshRecommendations}
                  disabled={recsLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-sky-600/30"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${recsLoading ? 'animate-spin' : ''}`} />
                  {recsLoading ? 'Rebuilding...' : 'Refresh Recommendations'}
                </button>
              )}
            </div>

            {!currentCandidate ? (
              <div className="p-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <LayoutDashboard className="w-10 h-10 text-slate-600 mx-auto" />
                <p>Upload a resume or select a candidate preset to build personalised recommendations.</p>
                <button
                  onClick={() => setActiveTab('candidate')}
                  className="mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition"
                >
                  <UserCheck className="w-4 h-4" /> Go to Candidate Profile
                </button>
              </div>
            ) : (
              <RecommendationsDashboard
                data={recommendationsData}
                onViewBreakdown={(matchResult) => setSelectedMatch(matchResult)}
                loading={recsLoading}
              />
            )}
          </div>
        )}

        {/* ── TAB: JOB DISCOVERY ─────────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <FileSearch className="w-6 h-6 text-sky-400" />
                  Adzuna Job Discovery & Semantic Matching
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Local <code className="text-sky-300">all-MiniLM-L6-v2</code> evaluates candidate evidence against each company's actual JD.
                </p>
              </div>

              {currentCandidate && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchEvaluate}
                    disabled={batchMatchingLoading || searchLoading || !jobsData?.jobs?.length}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
                  >
                    <Play className={`w-3.5 h-3.5 ${batchMatchingLoading ? 'animate-spin' : ''}`} />
                    {batchMatchingLoading ? 'Evaluating...' : `Batch Match All for ${currentCandidate.name}`}
                  </button>

                  <button
                    onClick={handleBuildRecommendations}
                    disabled={recsLoading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Build Recommendations
                  </button>
                </div>
              )}
            </div>

            <JobSearch onSearch={handleSearch} loading={searchLoading} />

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>
                <strong className="text-white">{jobsData?.jobs?.length || 0}</strong> postings for{' '}
                <strong className="text-sky-300">"{lastSearchQuery}"</strong>
              </span>
              <span className="text-slate-500">Required (60%) + Preferred (25%) + Bonus (10%) + Experience (5%)</span>
            </div>

            {searchLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-sm font-medium">Fetching live job descriptions...</p>
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
              <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h4 className="text-base font-semibold text-white">No jobs found</h4>
                <p className="text-xs mt-1">Try a different role or location.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: SKILL GAP & ROADMAP ─────────────────────────────────── */}
        {activeTab === 'skillgap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Target className="w-6 h-6 text-sky-400" />
                Skill Gap Analysis & Personalized Learning Roadmap
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Cross-job gap analytics with priority-ordered free learning resources.
              </p>
            </div>

            {!currentCandidate ? (
              <div className="p-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <Target className="w-10 h-10 text-slate-600 mx-auto" />
                <p>Upload a resume or select a candidate first.</p>
                <button
                  onClick={() => setActiveTab('candidate')}
                  className="mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition"
                >
                  <UserCheck className="w-4 h-4" /> Go to Candidate Profile
                </button>
              </div>
            ) : (
              <SkillGapView candidateId={currentCandidate.id} candidateName={currentCandidate.name} />
            )}
          </div>
        )}

        {/* ── TAB: WHAT-IF SIMULATION ─────────────────────────────────── */}
        {activeTab === 'whatif' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Beaker className="w-6 h-6 text-purple-400" />
                What-If Skill Simulation
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Simulate adding skills to your profile and see real-time score recalculation using the same matching engine.
              </p>
            </div>

            {!currentCandidate ? (
              <div className="p-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
                <Beaker className="w-10 h-10 text-slate-600 mx-auto" />
                <p>Upload a resume or select a candidate first.</p>
                <button
                  onClick={() => setActiveTab('candidate')}
                  className="mx-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition"
                >
                  <UserCheck className="w-4 h-4" /> Go to Candidate Profile
                </button>
              </div>
            ) : (
              <WhatIfSimulator
                candidateId={currentCandidate.id}
                candidateName={currentCandidate.name}
                jobs={allEvaluatedJobs}
              />
            )}
          </div>
        )}

        {/* ── TAB: CANDIDATE INTELLIGENCE ─────────────────────────────────── */}
        {activeTab === 'candidate' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-sky-400" />
                Candidate Resume Parser & Evidence Extractor
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Local PyMuPDF parsing — projects, experience, and evidence-backed skill graph.
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
                <p className="text-sm font-medium">Extracting evidence with PyMuPDF...</p>
              </div>
            ) : currentCandidate ? (
              <CandidateProfileView candidate={currentCandidate} />
            ) : null}
          </div>
        )}

        {/* ── TAB: ESCO TAXONOMY ──────────────────────────────────────────── */}
        {activeTab === 'esco' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-sky-400" />
                ESCO Canonical Skills Taxonomy
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Standardized normalization — related skills kept distinct (Python ≠ Django, AWS ≠ Docker).
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['All', ...(canonicalTaxonomy?.categories || [])].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat === 'All' ? `All (${canonicalTaxonomy?.total_skills || 0})` : cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{skill.canonical_name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/40">{skill.category}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">ID: {skill.esco_id}</div>
                  {skill.synonyms?.length > 0 && (
                    <div className="text-xs text-slate-500">Aliases: {skill.synonyms.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: SYSTEM STATUS ──────────────────────────────────────────── */}
        {activeTab === 'system' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'API Server', value: isConnected ? 'FastAPI 1.0.0' : 'Disconnected', sub: 'MiniLM Matcher + Recommender + What-If', icon: Cpu, status: isConnected ? 'completed' : 'in-progress', badgeLabel: isConnected ? 'Healthy & Online' : 'Waiting' },
                { label: 'SQLite Database', value: `${recentCandidates?.length || 0} Candidates`, sub: 'skillgap.db — Jobs, Candidates, Matches', icon: Database, status: isDbOk ? 'completed' : 'in-progress', badgeLabel: isDbOk ? 'Connected' : 'Offline' },
                { label: 'Scoring Weights', value: 'Req 60% + Pref 25%', sub: 'Bonus 10% + Experience 5%', icon: Sliders, status: 'completed', badgeLabel: 'Evidence Hierarchy Active' },
              ].map(({ label, value, sub, icon: Icon, status, badgeLabel }) => (
                <div key={label} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                    <Icon className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <p className="text-xs text-slate-400">{sub}</p>
                  <StatusBadge status={status} label={badgeLabel} />
                </div>
              ))}
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Hackathon Phase Roadmap</h3>
                  <p className="text-xs text-slate-400">All 10 phases complete</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  10 of 10 Complete
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phases.map((phase) => (
                  <div
                    key={phase.id}
                    className="p-4 rounded-xl border flex items-start justify-between gap-4 bg-slate-900/90 border-emerald-500/30"
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
                    <StatusBadge status="completed" label="Done" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {selectedMatch && <MatchBreakdownModal matchResult={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      <footer className="border-t border-slate-800 py-6 px-6 text-center text-xs text-slate-500">
        SkillGap AI • All 10 Phases Complete — End-to-End AI Employment Recommendation System
      </footer>
    </div>
  );
}

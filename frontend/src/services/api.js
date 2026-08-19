import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Health & System
export const checkHealth = async () => (await api.get('/health')).data;
export const getSystemInfo = async () => (await api.get('/health/system-info')).data;

// Jobs & Adzuna Discovery
export const searchJobs = async (params) => (await api.post('/jobs/search', params)).data;
export const getJobById = async (id) => (await api.get(`/jobs/${id}`)).data;
export const getCachedStats = async () => (await api.get('/jobs/cached/stats')).data;

// JD Intelligence
export const parseJobRequirements = async (id) => (await api.post(`/jd/parse/${id}`)).data;
export const getJobRequirements = async (id) => (await api.get(`/jd/${id}/requirements`)).data;
export const getCanonicalSkills = async () => (await api.get('/jd/skills/canonical')).data;

// Candidate Intelligence
export const uploadResume = async (file, targetRole = 'Data Scientist') => {
  const form = new FormData();
  form.append('file', file);
  form.append('target_role', targetRole);
  return (await api.post('/candidates/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data;
};
export const loadCandidatePreset = async (presetId) =>
  (await api.post(`/candidates/load-preset/${presetId}`)).data;
export const getCandidateProfile = async (id) => (await api.get(`/candidates/${id}`)).data;
export const getRecentCandidates = async () => (await api.get('/candidates/recent/list')).data;

// Semantic Matching
export const evaluateJobMatch = async (candidateId, jobId) =>
  (await api.post('/match/evaluate-job', { candidate_id: candidateId, job_id: jobId })).data;
export const evaluateBatchJobs = async (candidateId, jobIds = null) =>
  (await api.post('/match/evaluate-all-jobs', { candidate_id: candidateId, job_ids: jobIds })).data;

// Tiered Recommendations
export const getRecommendationsDashboard = async (candidateId) =>
  (await api.get(`/recommendations/dashboard/${candidateId}`)).data;
export const refreshRecommendationsDashboard = async (candidateId, jobIds = null) =>
  (await api.post(`/recommendations/dashboard/${candidateId}/refresh`, jobIds ? { job_ids: jobIds } : {})).data;

// Skill Gap & Explainability (Phase 7)
export const getExplainabilityReport = async (candidateId, jobId) =>
  (await api.get(`/skillgap/report/${candidateId}/job/${jobId}`)).data;
export const getCandidateGapSummary = async (candidateId) =>
  (await api.get(`/skillgap/summary/${candidateId}`)).data;

// Learning Roadmap (Phase 8)
export const getJobRoadmap = async (candidateId, jobId) =>
  (await api.get(`/roadmap/job/${candidateId}/${jobId}`)).data;
export const getGlobalRoadmap = async (candidateId) =>
  (await api.get(`/roadmap/global/${candidateId}`)).data;

// What-If Simulation (Phase 9)
export const simulateWhatIf = async (candidateId, jobId, addedSkills) =>
  (await api.post('/whatif/simulate', { candidate_id: candidateId, job_id: jobId, added_skills: addedSkills })).data;
export const simulateWhatIfGlobal = async (candidateId, addedSkills) =>
  (await api.post('/whatif/simulate-global', { candidate_id: candidateId, added_skills: addedSkills })).data;

export default api;

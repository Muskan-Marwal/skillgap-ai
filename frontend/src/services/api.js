import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health & System
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getSystemInfo = async () => {
  const response = await api.get('/health/system-info');
  return response.data;
};

// Jobs & Adzuna Discovery
export const searchJobs = async (searchParams) => {
  const response = await api.post('/jobs/search', searchParams);
  return response.data;
};

export const getJobById = async (jobId) => {
  const response = await api.get(`/jobs/${jobId}`);
  return response.data;
};

export const getCachedStats = async () => {
  const response = await api.get('/jobs/cached/stats');
  return response.data;
};

// JD Intelligence & Requirement Extraction
export const parseJobRequirements = async (jobId) => {
  const response = await api.post(`/jd/parse/${jobId}`);
  return response.data;
};

export const getJobRequirements = async (jobId) => {
  const response = await api.get(`/jd/${jobId}/requirements`);
  return response.data;
};

export const getCanonicalSkills = async () => {
  const response = await api.get('/jd/skills/canonical');
  return response.data;
};

// Candidate Intelligence & Resume Parsing
export const uploadResume = async (file, targetRole = 'Data Scientist') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_role', targetRole);

  const response = await api.post('/candidates/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const loadCandidatePreset = async (presetId) => {
  const response = await api.post(`/candidates/load-preset/${presetId}`);
  return response.data;
};

export const getCandidateProfile = async (candidateId) => {
  const response = await api.get(`/candidates/${candidateId}`);
  return response.data;
};

export const getRecentCandidates = async () => {
  const response = await api.get('/candidates/recent/list');
  return response.data;
};

// Semantic Matching Engine
export const evaluateJobMatch = async (candidateId, jobId) => {
  const response = await api.post('/match/evaluate-job', {
    candidate_id: candidateId,
    job_id: jobId,
  });
  return response.data;
};

export const evaluateBatchJobs = async (candidateId, jobIds = null) => {
  const response = await api.post('/match/evaluate-all-jobs', {
    candidate_id: candidateId,
    job_ids: jobIds,
  });
  return response.data;
};

export default api;

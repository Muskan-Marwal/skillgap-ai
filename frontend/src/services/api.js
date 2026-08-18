import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getSystemInfo = async () => {
  const response = await api.get('/health/system-info');
  return response.data;
};

export default api;

import axios from 'axios';

let API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
if (API_URL.includes("VITE_API_URL=")) {
  API_URL = API_URL.split("VITE_API_URL=").pop().trim();
}

let rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();
if (rawApiUrl.includes("VITE_API_URL=")) {
  rawApiUrl = rawApiUrl.split("VITE_API_URL=").pop().trim();
}
const SOCKET_URL = rawApiUrl ? rawApiUrl.replace('/api', '') : 'http://localhost:5000';
console.log("Resolved Socket URL:", SOCKET_URL);
console.log("Resolved API URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout to avoid hanging requests
});

api.interceptors.request.use((config) => {
  if (config.url && config.url.startsWith('/') && !config.url.startsWith('http')) {
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timed out');
    }
    return Promise.reject(error);
  }
);

export default api;

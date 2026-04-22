import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout to avoid hanging requests
});

api.interceptors.request.use((config) => {
  // Normalize URL to handle leading slashes correctly with baseURL
  if (config.url && config.url.startsWith('/') && !config.url.startsWith('http')) {
    // If the path starts with / and it's not an absolute URL, 
    // we make it relative to the baseURL by removing the leading slash.
    // This prevents axios from stripping the path of the baseURL (like /api).
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
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

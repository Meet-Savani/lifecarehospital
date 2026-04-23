import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
if (API_URL && API_URL.startsWith("VITE_API_URL=")) {
  API_URL = API_URL.replace("VITE_API_URL=", "");
}

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

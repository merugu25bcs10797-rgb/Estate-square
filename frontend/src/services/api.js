import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8084';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 45000 // 45 seconds to accommodate cold starts
});

// Callback listeners for global session/network events
let onUnauthorizedCallback = null;
let onServerWakeupCallback = null;

export const setOnUnauthorized = (callback) => {
  onUnauthorizedCallback = callback;
};

export const setOnServerWakeup = (callback) => {
  onServerWakeupCallback = callback;
};

// Request interceptor: tracks pending requests
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor: handles 401 and network errors
api.interceptors.response.use(
  (response) => {
    if (onServerWakeupCallback) {
      onServerWakeupCallback(false);
    }
    return response;
  },
  (error) => {
    // Check if network error or server waking up (Render free tier)
    if (!error.response && error.code === 'ERR_NETWORK') {
      if (onServerWakeupCallback) {
        onServerWakeupCallback(true);
      }
    }

    // 401 Unauthorized handling
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if the 401 came from an initial /api/auth/me check
      const isAuthCheck = error.config && error.config.url && error.config.url.includes('/api/auth/me');
      if (!isAuthCheck && onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

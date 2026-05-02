import axios from 'axios';

// Set base URL for all API requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Enable sending cookies with requests
axios.defaults.withCredentials = true;

// CSRF token configuration (Axios handles double-submit cookies automatically)
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';

// Automatically attach JWT token from localStorage if available
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

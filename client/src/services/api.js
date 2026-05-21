/**
 * Axios API Service
 * Centralized HTTP client with interceptors for auth and error handling
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Auto logout on 401 (token expired/invalid)
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH SERVICES ====================
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updatePassword: (data) => api.put('/auth/password', data),
  verifyToken: () => api.get('/auth/verify'),
};

// ==================== URL SERVICES ====================
export const urlService = {
  createUrl: (data) => api.post('/url/create', data),
  getAllUrls: (params) => api.get('/url/all', { params }),
  getUrlById: (id) => api.get(`/url/${id}`),
  updateUrl: (id, data) => api.put(`/url/${id}`, data),
  deleteUrl: (id) => api.delete(`/url/${id}`),
  getAnalytics: (shortCode) => api.get(`/url/analytics/${shortCode}`),
  getDashboardStats: () => api.get('/url/stats'),
  bulkCreate: (formData) => api.post('/url/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  exportAnalytics: () => api.get('/url/export', { responseType: 'blob' }),
  regenerateQR: (id) => api.post(`/url/${id}/qr`),
};

export default api;

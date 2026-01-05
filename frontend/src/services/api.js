import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Connection endpoints
export const connectionApi = {
  getAll: () => api.get('/connections'),
  getById: (id) => api.get(`/connections/${id}`),
  create: (data) => api.post('/connections', data),
  update: (id, data) => api.put(`/connections/${id}`, data),
  delete: (id) => api.delete(`/connections/${id}`),
  test: (id) => api.post(`/connections/${id}/test`),
  discoverTopics: (id) => api.get(`/connections/${id}/topics/discover`),
};

// Topic endpoints
export const topicApi = {
  getByConnection: (connectionId) => api.get(`/topics/connection/${connectionId}`),
  getById: (id) => api.get(`/topics/${id}`),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  sync: (connectionId, topicNames) => api.post(`/topics/connection/${connectionId}/sync`, topicNames),
  getMessages: (topicId, params) => api.get(`/topics/${topicId}/messages`, { params }),
  getRecentMessages: (topicId) => api.get(`/topics/${topicId}/messages/recent`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;

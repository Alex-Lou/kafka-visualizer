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
  create: (connectionId, data) => api.post(`/topics/connection/${connectionId}/create`, data),
  update: (id, data) => api.put(`/topics/${id}`, data),
  delete: (id) => api.delete(`/topics/${id}`),
  deleteFromKafka: (id) => api.delete(`/topics/${id}/kafka`),
  sync: (connectionId, topicNames) => api.post(`/topics/connection/${connectionId}/sync`, topicNames),
  getMessages: (topicId, params) => api.get(`/topics/${topicId}/messages`, { params }),
  getRecentMessages: (topicId) => api.get(`/topics/${topicId}/messages/recent`),
  getLiveStats: (topicId) => api.get(`/topics/${topicId}/live-stats`),
};


export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const healthApi = {
  getHealth: () => api.get('/health'),
  getSimpleHealth: () => api.get('/health/simple'),
};

export const flowApi = {
  getAll: () => api.get('/flows'),
  getById: (id) => api.get(`/flows/${id}`),
  getByConnection: (connectionId) => api.get(`/flows/connection/${connectionId}`),
  create: (data) => api.post('/flows', data),
  update: (id, data) => api.put(`/flows/${id}`, data),
  updateLayout: (id, data) => api.put(`/flows/${id}/layout`, data),
  delete: (id) => api.delete(`/flows/${id}`),
};

// ═══════════════════════════════════════════════════════════════════════
// CLEANUP API - Gestion des éléments orphelins
// ═══════════════════════════════════════════════════════════════════════

export const cleanupApi = {
  getOverview: () => api.get('/cleanup'),
  
  count: () => api.get('/cleanup/count'),
  
  deleteSelected: (connectionIds = [], topicIds = []) => 
    api.delete('/cleanup', { data: { connectionIds, topicIds } }),
  
  deleteAll: () => api.delete('/cleanup/all'),
};

export const retentionApi = {
  // Policies
  getPolicies: () => api.get('/retention/policies'),
  getGlobalPolicy: () => api.get('/retention/policies/global'),
  getTopicPolicy: (topicId) => api.get(`/retention/policies/topic/${topicId}`),
  createPolicy: (data) => api.post('/retention/policies', data),
  updatePolicy: (id, data) => api.put(`/retention/policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/retention/policies/${id}`),

  getGlobalStorage: () => api.get('/retention/storage'),
  getTopicStorage: (topicId) => api.get(`/retention/storage/topic/${topicId}`),

  getArchives: (params) => api.get('/retention/archives', { params }),
  getArchive: (id) => api.get(`/retention/archives/${id}`),

  getTopicStats: (topicId, hours = 24) => api.get(`/retention/stats/topic/${topicId}`, { params: { hours } }),
  getDashboardStats: () => api.get('/retention/stats/dashboard'),

  triggerArchive: () => api.post('/retention/storage/archive'),
  triggerPurge: () => api.post('/retention/storage/purge'),
  triggerStatsAggregation: () => api.post('/retention/actions/aggregate-stats'),
  resetTopic: (topicId, data) => api.post(`/retention/storage/topic/${topicId}/reset`, data),
  archiveTopic: (topicId) => api.post(`/retention/storage/topic/${topicId}/archive`),
  archiveMessages: (messageIds) => api.post('/retention/storage/messages/archive', messageIds),
  
  bookmarkMessage: (messageId, bookmarked) => 
    api.post('/retention/storage/messages/bookmark', {}, { 
      params: { 
        messageId: messageId, 
        isBookmarked: bookmarked 
      } 
    }),

  getJobLogs: (params) => api.get('/retention/jobs', { params }),
  getJobStats: () => api.get('/retention/jobs/stats'),
};

export const archiveApi = {
  getAll: (params) => api.get('/archives', { params }),
  
  getById: (id) => api.get(`/archives/${id}`),
  
  getStats: () => api.get('/archives/stats'),
  
  getFilterOptions: () => api.get('/archives/filters'),
  
  exportJson: (params) => api.get('/archives/export/json', { 
    params, 
    responseType: 'blob' 
  }),
  exportCsv: (params) => api.get('/archives/export/csv', { 
    params, 
    responseType: 'blob' 
  }),
  exportCustom: (data) => api.post('/archives/export', data, { 
    responseType: 'blob' 
  }),
  
  delete: (id) => api.delete(`/archives/${id}`),
  deleteBulk: (data) => api.delete('/archives', { data }),
  
  restore: (data) => api.post('/archives/restore', data),
};

export const userApi = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default api;
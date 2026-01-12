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
  getLiveStats: (topicId) => api.get(`/topics/${topicId}/live-stats`),
};

// Dashboard endpoints
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health endpoints
export const healthApi = {
  getHealth: () => api.get('/health'),
  getSimpleHealth: () => api.get('/health/simple'),
};

// Flow endpoints
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
  /** Récupère la vue d'ensemble (connexions + topics orphelins) */
  getOverview: () => api.get('/cleanup'),
  
  /** Compte le nombre total d'orphelins */
  count: () => api.get('/cleanup/count'),
  
  /** Supprime les éléments sélectionnés */
  deleteSelected: (connectionIds = [], topicIds = []) => 
    api.delete('/cleanup', { data: { connectionIds, topicIds } }),
  
  /** Supprime TOUS les éléments orphelins */
  deleteAll: () => api.delete('/cleanup/all'),
};

// Retention endpoints
export const retentionApi = {
  // Policies
  getPolicies: () => api.get('/retention/policies'),
  getGlobalPolicy: () => api.get('/retention/policies/global'),
  getTopicPolicy: (topicId) => api.get(`/retention/policies/topic/${topicId}`),
  createPolicy: (data) => api.post('/retention/policies', data),
  updatePolicy: (id, data) => api.put(`/retention/policies/${id}`, data),
  deletePolicy: (id) => api.delete(`/retention/policies/${id}`),

  // Storage
  getGlobalStorage: () => api.get('/retention/storage'),
  getTopicStorage: (topicId) => api.get(`/retention/storage/topic/${topicId}`),

  // Archives
  getArchives: (params) => api.get('/retention/archives', { params }),
  getArchive: (id) => api.get(`/retention/archives/${id}`),

  // Stats
  getTopicStats: (topicId, hours = 24) => api.get(`/retention/stats/topic/${topicId}`, { params: { hours } }),
  getDashboardStats: () => api.get('/retention/stats/dashboard'),

  // Actions
  triggerArchive: () => api.post('/retention/actions/archive'),
  triggerPurge: () => api.post('/retention/actions/purge'),
  triggerStatsAggregation: () => api.post('/retention/actions/aggregate-stats'),
  resetTopic: (topicId, data) => api.post(`/retention/actions/reset-topic/${topicId}`, data),
  archiveTopic: (topicId) => api.post(`/retention/actions/archive-topic/${topicId}`),
  archiveMessages: (messageIds) => api.post('/retention/actions/archive-messages', messageIds),
  bookmarkMessage: (messageId, bookmarked) => api.post(`/retention/messages/${messageId}/bookmark`, {}, { params: { bookmarked } }),

  // Job logs
  getJobLogs: (params) => api.get('/retention/jobs', { params }),
  getJobStats: () => api.get('/retention/jobs/stats'),
};

export const archiveApi = {
  // Get archives with filters
  getAll: (params) => api.get('/archives', { params }),
  
  // Get single archive (full content)
  getById: (id) => api.get(`/archives/${id}`),
  
  // Get statistics
  getStats: () => api.get('/archives/stats'),
  
  // Get filter options (for dropdowns)
  getFilterOptions: () => api.get('/archives/filters'),
  
  // Export archives
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
  
  // Delete archives
  delete: (id) => api.delete(`/archives/${id}`),
  deleteBulk: (data) => api.delete('/archives', { data }),
  
  // Restore archives
  restore: (data) => api.post('/archives/restore', data),
};

export default api;
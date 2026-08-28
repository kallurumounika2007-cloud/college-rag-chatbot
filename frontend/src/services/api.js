import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('college_bot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauth redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401
      localStorage.removeItem('college_bot_token');
      localStorage.removeItem('college_bot_user');
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role = 'student') => api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// --- Chat & Conversation Endpoints ---
export const chatAPI = {
  ask: (query, conversationId = null, department = null, language = 'en') => 
    api.post('/chat', { 
      query, 
      conversation_id: conversationId,
      department: department && department !== 'All' ? department : null,
      language: language || 'en'
    }),
  sendFeedback: (messageId, isPositive, comment = '') => api.post('/chat/feedback', { message_id: messageId, is_positive: isPositive, comment }),
  getConversations: () => api.get('/conversations'),
  getConversationDetail: (id) => api.get(`/conversations/${id}`),
  renameConversation: (id, title) => api.patch(`/conversations/${id}`, { title }),
  deleteConversation: (id) => api.delete(`/conversations/${id}`),
};

// --- FAQ Endpoints ---
export const faqAPI = {
  getFAQs: () => api.get('/faqs'),
};

// --- Document & Admin Endpoints ---
export const documentAPI = {
  getDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`),
  getDocumentChunks: (id) => api.get(`/documents/${id}/chunks`),
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  seedSampleDocuments: () => api.post('/documents/seed-samples'),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
};

export default api;

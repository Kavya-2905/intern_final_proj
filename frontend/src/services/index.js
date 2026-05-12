import api from './api';

export const authService = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data)
};

export const bankingService = {
  getDashboard: () => api.get('/api/banking/dashboard'),
  deposit: (data) => api.post('/api/banking/deposit', data),
  withdraw: (data) => api.post('/api/banking/withdraw', data),
  transfer: (data) => api.post('/api/banking/transfer', data),
  getTransactions: (params) => api.get('/api/banking/transactions', { params })
};

export const loanService = {
  applyLoan: (data) => api.post('/api/loans/apply', data),
  getLoans: () => api.get('/api/loans'),
  calculateEMI: (data) => api.post('/api/loans/calculate-emi', data),
  checkEligibility: (data) => api.post('/api/loans/check-eligibility', data)
};

export const cardService = {
  getCards: () => api.get('/api/cards'),
  createCard: (data) => api.post('/api/cards', data),
  toggleFreeze: (id) => api.put(`/api/cards/${id}/toggle-freeze`),
  updateLimit: (id, data) => api.put(`/api/cards/${id}/limit`, data)
};

export const kycService = {
  submitKYC: (formData) => api.post('/api/kyc/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getKYCStatus: () => api.get('/api/kyc/status')
};

export const notificationService = {
  getNotifications: (params) => api.get('/api/notifications', { params }),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all')
};

export const chatbotService = {
  sendMessage: (message) => api.post('/api/chatbot/message', { message }),
  getHistory: () => api.get('/api/chatbot/history'),
  clearHistory: () => api.delete('/api/chatbot/history')
};

export const adminService = {
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getAnalytics: () => api.get('/api/admin/analytics'),
  getPendingLoans: () => api.get('/api/admin/loans/pending'),
  approveKYC: (userId) => api.put(`/api/admin/kyc/${userId}/approve`),
  rejectKYC: (userId) => api.put(`/api/admin/kyc/${userId}/reject`),
  approveLoan: (loanId) => api.put(`/api/admin/loans/${loanId}/approve`),
  rejectLoan: (loanId, remarks) => api.put(`/api/admin/loans/${loanId}/reject`, { remarks })
};

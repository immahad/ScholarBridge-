import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If you have a router: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    console.log('Login request payload:', credentials);
    return api.post('/auth/login', credentials);
  },
  adminLogin: (credentials) => {
    console.log('Admin login request payload:', credentials);
    return api.post('/auth/admin-login', credentials);
  },
  checkAdmin: (email) => {
    console.log('Check admin request for email:', email);
    return api.get('/auth/check-admin', { params: { email } });
  },
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
};

// Student services
const studentService = {
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getApplications: () => api.get('/students/applications'),
};

// Scholarship services
const scholarshipService = {
  getAllScholarships: (filters) => api.get('/scholarships', { params: filters }),
  getScholarship: (id) => api.get(`/scholarships/${id}`),
  createScholarship: (scholarshipData) => api.post('/scholarships', scholarshipData),
  updateScholarship: (id, scholarshipData) => api.put(`/scholarships/${id}`, scholarshipData),
  deleteScholarship: (id) => api.delete(`/scholarships/${id}`),
  applyForScholarship: (id, applicationData) => api.post(`/applications/apply/${id}`, applicationData),
};

// Admin services
const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (userId) => api.get(`/admin/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  // Scholarship management endpoints - using the scholarship endpoint directly
  getAllScholarships: (params) => api.get('/scholarships', { params }),
  getScholarshipById: (id) => api.get(`/scholarships/${id}`),
  createScholarship: (scholarshipData) => api.post('/scholarships', scholarshipData),
  updateScholarship: (id, scholarshipData) => api.put(`/scholarships/${id}`, scholarshipData),
  deleteScholarship: (id) => api.delete(`/scholarships/${id}`),
  getScholarshipApplications: (id) => api.get(`/scholarships/${id}/applications`),
};

export { api, authService, studentService, scholarshipService, adminService };
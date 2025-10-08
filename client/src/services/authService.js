// ============================================================================
// CLIENT - AUTH SERVICE
// ============================================================================

// client/src/services/authService.js
import api from './api';

const authService = {
  // Login user
  login: (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Register user
  register: (userData) => {
    return api.post('/auth/register', userData);
  },

  // Get current user
  getMe: () => {
    return api.get('/auth/me');
  },

  // Update profile
  updateProfile: (profileData) => {
    return api.put('/auth/profile', profileData);
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('auth-storage');
  }
};

export default authService;
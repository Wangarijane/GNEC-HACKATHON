// ============================================================================
// CLIENT - AUTH STORE (ZUSTAND)
// ============================================================================

// client/src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // Login action
      login: async (credentials) => {
        set({ loading: true });
        try {
          const response = await authService.login(credentials);
          const { user, token } = response.data?.data || {};
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ loading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      // Register action
      register: async (userData) => {
        set({ loading: true });
        try {
          const response = await authService.register(userData);
          const { user, token } = response.data?.data || {};
          
          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          });
          
          return { success: true, data: response.data };
        } catch (error) {
          set({ loading: false });
          return { 
            success: false, 
            message: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      // Logout action
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      },

      // Update user profile
      updateUser: (updatedUser) => {
        set({ user: updatedUser });
      },

      // Initialize auth state
      initialize: async () => {
        const state = get();
        if (state.token && !state.user) {
          try {
            set({ loading: true });
            const response = await authService.getMe();
            set({
              user: response.data?.data?.user,
              isAuthenticated: true,
              loading: false
            });
          } catch (error) {
            console.error('Auth initialization error:', error);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false
            });
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
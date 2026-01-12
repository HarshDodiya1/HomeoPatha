/**
 * Authentication Store
 * Zustand store for managing authentication state
 * Updated for new Node.js backend API (api-docs.json)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/services/auth.service';
import { STORAGE_KEYS } from '@/lib/api/config';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthState,
} from '@/types/auth';

interface AuthStore extends AuthState {
  // Additional state
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Initialize auth state from localStorage - only once per session
      initialize: async () => {
        // Prevent multiple initializations
        if (get().isInitialized) {
          return;
        }

        if (typeof window === 'undefined') {
          set({ isInitialized: true });
          return;
        }

        try {
          const token = localStorage.getItem(STORAGE_KEYS.accessToken);
          const userStr = localStorage.getItem(STORAGE_KEYS.user);

          if (token && userStr) {
            // Token exists and user data exists - verify with server
            try {
              const userData = await authService.getCurrentUser();
              set({
                user: userData,
                accessToken: token,
                isAuthenticated: true,
                isInitialized: true,
              });
            } catch (error: any) {
              // If fetching user fails with 401, token is invalid - clear auth state
              if (error.response?.status === 401) {
                localStorage.removeItem(STORAGE_KEYS.accessToken);
                localStorage.removeItem(STORAGE_KEYS.user);
                localStorage.removeItem('auth-storage');
                set({
                  user: null,
                  accessToken: null,
                  isAuthenticated: false,
                  isInitialized: true,
                });
              } else {
                // For other errors (network issues), use cached user data temporarily
                const user = JSON.parse(userStr);
                set({
                  user,
                  accessToken: token,
                  isAuthenticated: true,
                  isInitialized: true,
                });
              }
            }
          } else {
            // No token or user data, user not authenticated
            localStorage.removeItem(STORAGE_KEYS.accessToken);
            localStorage.removeItem(STORAGE_KEYS.user);
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isInitialized: true });
        }
      },

      // Login action
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          // Store token and user data
          localStorage.setItem(STORAGE_KEYS.accessToken, response.data.token);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data.user));

          set({
            user: response.data.user,
            accessToken: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || 
            error.message || 
            'Login failed. Please check your credentials.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });

          throw error;
        }
      },

      // Register action
      register: async (data: RegisterRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.register(data);

          // Store token and user data
          localStorage.setItem(STORAGE_KEYS.accessToken, response.data.token);
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(response.data.user));

          set({
            user: response.data.user,
            accessToken: response.data.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Registration failed. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });

          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });

        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        } finally {
          // Clear localStorage
          localStorage.removeItem(STORAGE_KEYS.accessToken);
          localStorage.removeItem(STORAGE_KEYS.user);
          // Also clear the Zustand persisted auth state
          localStorage.removeItem('auth-storage');

          // Reset state
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Set user
      setUser: (user: User | null) => {
        set({ user });
        if (user) {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.user);
        }
      },

      // Set error
      setError: (error: string | null) => {
        set({ error });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        // Don't persist isInitialized - it should always start as false
        // and be set to true after initialization check on each page load
      }),
    }
  )
);

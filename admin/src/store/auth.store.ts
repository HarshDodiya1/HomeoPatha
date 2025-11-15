/**
 * Authentication Store
 * Zustand store for managing authentication state
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
      refreshToken: null,
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
          const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
          const userStr = localStorage.getItem(STORAGE_KEYS.user);
          const expiry = localStorage.getItem(STORAGE_KEYS.tokenExpiry);

          if (token && expiry) {
            const expiryTime = parseInt(expiry);
            const now = Date.now();

            // Check if token is still valid
            if (now < expiryTime) {
              // Token is valid - try to fetch fresh user data
              // First set the token in state so the interceptor can use it
              try {
                const userData = await authService.getCurrentUser();
                set({
                  user: userData,
                  accessToken: token,
                  refreshToken: refreshToken || null,
                  isAuthenticated: true,
                  isInitialized: true,
                });
              } catch (error) {
                // If fetching user fails, use cached user data
                if (userStr) {
                  const user = JSON.parse(userStr);
                  set({
                    user,
                    accessToken: token,
                    refreshToken: refreshToken || null,
                    isAuthenticated: true,
                    isInitialized: true,
                  });
                } else {
                  // No cached user, clear auth
                  localStorage.removeItem(STORAGE_KEYS.accessToken);
                  localStorage.removeItem(STORAGE_KEYS.refreshToken);
                  localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
                  localStorage.removeItem(STORAGE_KEYS.user);
                  set({ isInitialized: true });
                }
              }
            } else {
              // Token expired, clear everything
              localStorage.removeItem(STORAGE_KEYS.accessToken);
              localStorage.removeItem(STORAGE_KEYS.refreshToken);
              localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
              localStorage.removeItem(STORAGE_KEYS.user);
              set({ isInitialized: true });
            }
          } else {
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

          // Calculate token expiry time (expires_in is in seconds)
          const expiryTime = Date.now() + response.expires_in * 1000;

          // Store token in localStorage FIRST so the API client can use it
          localStorage.setItem(STORAGE_KEYS.accessToken, response.access_token);
          localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());

          if (response.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh_token);
          }

          // Now fetch user profile with the token from localStorage
          let user: User;
          try {
            user = await authService.getCurrentUser();
          } catch (error) {
            // Fallback if user fetch fails
            user = {
              id: '',
              username: credentials.username,
              email: '',
              user_type: 'ADMIN',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;
          }

          // Store user data
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

          set({
            user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 
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

          // Calculate token expiry time
          const expiryTime = Date.now() + response.expires_in * 1000;

          // Store token in localStorage FIRST so the API client can use it
          localStorage.setItem(STORAGE_KEYS.accessToken, response.access_token);
          localStorage.setItem(STORAGE_KEYS.tokenExpiry, expiryTime.toString());

          if (response.refresh_token) {
            localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh_token);
          }

          // Now fetch user profile with the token from localStorage
          let user: User;
          try {
            user = await authService.getCurrentUser();
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            // Fallback if user fetch fails
            user = {
              id: '',
              username: data.username,
              email: data.email,
              user_type: data.role,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as User;
          }

          // Store user data
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

          set({
            user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail ||
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
          localStorage.removeItem(STORAGE_KEYS.refreshToken);
          localStorage.removeItem(STORAGE_KEYS.tokenExpiry);
          localStorage.removeItem(STORAGE_KEYS.user);

          // Reset state
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
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
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

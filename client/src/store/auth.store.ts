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
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '@/types/auth';

interface AuthStore extends AuthState {
  // Additional state
  isInitialized: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
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

      // Initialize auth state from localStorage
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
            try {
              const userData = await authService.getCurrentUser();
              set({
                user: userData,
                accessToken: token,
                isAuthenticated: true,
                isInitialized: true,
              });
            } catch (error) {
              // If fetching user fails, use cached user data
              const user = JSON.parse(userStr);
              set({
                user,
                accessToken: token,
                isAuthenticated: true,
                isInitialized: true,
              });
            }
          } else {
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
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear localStorage and state
          localStorage.removeItem(STORAGE_KEYS.accessToken);
          localStorage.removeItem(STORAGE_KEYS.user);

          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      // Update profile action
      updateProfile: async (data: UpdateProfileRequest) => {
        set({ isLoading: true, error: null });

        try {
          const updatedUser = await authService.updateProfile(data);
          
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(updatedUser));

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to update profile. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      // Change password action
      changePassword: async (data: ChangePasswordRequest) => {
        set({ isLoading: true, error: null });

        try {
          await authService.changePassword(data);

          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Failed to change password. Please try again.';

          set({
            isLoading: false,
            error: errorMessage,
          });

          throw error;
        }
      },

      // Set user
      setUser: (user: User | null) => {
        set({ user });
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
      name: 'homeopatha-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

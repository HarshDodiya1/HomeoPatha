/**
 * Authentication Service
 * API calls for authentication operations
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthResponse,
  UserResponse,
  User,
} from '@/types/auth';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      data
    );
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<UserResponse>(API_ENDPOINTS.auth.me);
    return response.data.data.user;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<UserResponse>(
      API_ENDPOINTS.auth.updateProfile,
      data
    );
    return response.data.data.user;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.put(API_ENDPOINTS.auth.changePassword, data);
  },
};

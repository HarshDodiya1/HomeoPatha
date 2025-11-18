/**
 * Authentication Service
 * API calls for authentication operations
 * Updated for new Node.js backend API (api-docs.json)
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ApiResponse,
} from '@/types/auth';

export const authService = {
  /**
   * Login user with email and password
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
    const response = await apiClient.get<ApiResponse<User>>(
      API_ENDPOINTS.auth.me
    );
    return response.data.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>(
      API_ENDPOINTS.auth.updateProfile,
      data
    );
    return response.data.data!;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(
      API_ENDPOINTS.auth.changePassword,
      data
    );
    return response.data;
  },
};

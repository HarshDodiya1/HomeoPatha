/**
 * Authentication Service
 * API calls for authentication operations
 */

import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import {
  LoginRequest,
  RegisterRequest,
  JWTResponse,
  ActivityResponse,
  User,
} from '@/types/auth';

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<JWTResponse> {
    const response = await apiClient.post<JWTResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<JWTResponse> {
    const response = await apiClient.post<JWTResponse>(
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
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<JWTResponse> {
    const response = await apiClient.post<JWTResponse>(
      API_ENDPOINTS.auth.refreshToken,
      { refresh_token: refreshToken }
    );
    return response.data;
  },

  /**
   * Get user activity
   */
  async getActivity(): Promise<ActivityResponse> {
    const response = await apiClient.get<ActivityResponse>(
      API_ENDPOINTS.auth.activity
    );
    return response.data;
  },

  /**
   * Get current user profile
   * API returns user data with proper structure
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.users.me
    );

    // Handle the response from /api/users/me
    // It returns a direct user object, not wrapped like /api/users
    const data = response.data;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      user_type: data.userType || data.user_type,
      is_active: data.isActive !== undefined ? data.isActive : data.is_active,
      created_at: data.createdAt || data.created_at,
      updated_at: data.updatedAt || data.updated_at,
      last_login: data.lastLogin || data.last_login,
    };
  },

  /**
   * Get all users
   * API returns UserInResponse[] with wrapped authorized_user, we extract and transform it
   */
  async getAllUsers(): Promise<User[]> {
    interface UserInResponseAPI {
      id: string;
      authorized_user: {
        username: string;
        email: string;
        user_type: string;
        is_active: boolean;
        is_verified: boolean;
        is_logged_in: boolean;
        created_at: string;
        updated_at: string;
      };
    }

    const response = await apiClient.get<UserInResponseAPI[]>(
      API_ENDPOINTS.users.list
    );

    // Transform API response to User format
    return response.data.map((userResponse) => ({
      id: userResponse.id,
      username: userResponse.authorized_user.username,
      email: userResponse.authorized_user.email,
      user_type: userResponse.authorized_user.user_type as any,
      is_active: userResponse.authorized_user.is_active,
      created_at: userResponse.authorized_user.created_at,
      updated_at: userResponse.authorized_user.updated_at,
      last_login: userResponse.authorized_user.updated_at,
    }));
  },

  /**
   * Get user by ID
   * API returns UserInResponse with wrapped authorized_user, we extract and transform it
   */
  async getUserById(id: string): Promise<User> {
    interface UserInResponseAPI {
      id: string;
      authorized_user: {
        username: string;
        email: string;
        user_type: string;
        is_active: boolean;
        is_verified: boolean;
        is_logged_in: boolean;
        created_at: string;
        updated_at: string;
      };
    }

    const response = await apiClient.get<UserInResponseAPI>(
      API_ENDPOINTS.users.detail(id)
    );

    // Transform API response to User format
    return {
      id: response.data.id,
      username: response.data.authorized_user.username,
      email: response.data.authorized_user.email,
      user_type: response.data.authorized_user.user_type as any,
      is_active: response.data.authorized_user.is_active,
      created_at: response.data.authorized_user.created_at,
      updated_at: response.data.authorized_user.updated_at,
      last_login: response.data.authorized_user.updated_at,
    };
  },

  /**
   * Update user
   * API returns UserInResponse with wrapped authorized_user, we extract and transform it
   */
  async updateUser(
    id: string,
    data: {
      username?: string;
      email?: string;
      password?: string;
      user_type?: string;
    }
  ): Promise<User> {
    interface UserInResponseAPI {
      id: string;
      authorized_user: {
        username: string;
        email: string;
        user_type: string;
        is_active: boolean;
        is_verified: boolean;
        is_logged_in: boolean;
        created_at: string;
        updated_at: string;
      };
    }

    const params = new URLSearchParams();
    params.append('query_id', id);
    if (data.username) params.append('update_username', data.username);
    if (data.email) params.append('update_email', data.email);
    if (data.password) params.append('update_password', data.password);
    if (data.user_type) params.append('update_user_type', data.user_type);

    const response = await apiClient.patch<UserInResponseAPI>(
      `${API_ENDPOINTS.users.update(id)}?${params.toString()}`
    );

    // Transform API response to User format
    return {
      id: response.data.id,
      username: response.data.authorized_user.username,
      email: response.data.authorized_user.email,
      user_type: response.data.authorized_user.user_type as any,
      is_active: response.data.authorized_user.is_active,
      created_at: response.data.authorized_user.created_at,
      updated_at: response.data.authorized_user.updated_at,
      last_login: response.data.authorized_user.updated_at,
    };
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ [key: string]: string }> {
    const response = await apiClient.delete<{ [key: string]: string }>(
      API_ENDPOINTS.users.delete,
      { params: { id } }
    );
    return response.data;
  },
};

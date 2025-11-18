/**
 * Authentication Types
 * TypeScript interfaces for authentication-related data structures
 * Based on new Node.js backend API (api-docs.json)
 */

export enum UserRoleEnum {
  SUPERADMIN = 'superadmin',
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export interface Address {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    user: User;
    token: string;
  };
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRoleEnum;
  addresses?: Address[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  addresses?: Address[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: string;
  data?: T;
  errors?: {
    [key: string]: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Auth Types
 */

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'patient' | 'doctor' | 'superadmin';
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
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

export interface AuthResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    user: User;
    token: string;
  };
}

export interface UserResponse {
  success: boolean;
  message: string;
  code: string;
  data: {
    user: User;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

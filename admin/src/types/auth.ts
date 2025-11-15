/**
 * Authentication Types
 * TypeScript interfaces for authentication-related data structures
 */

export enum UserTypeEnum {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  RIDER = 'RIDER',
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
  role: UserTypeEnum;
}

export interface JWTResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  user_type: UserTypeEnum;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface ActivityRecord {
  timestamp: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  location?: {
    country?: string;
    city?: string;
  };
  is_android: boolean;
  model?: string;
  os_version?: string;
}

export interface ActivityResponse {
  recent_activity: ActivityRecord[];
  suspicious_activity: any[];
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

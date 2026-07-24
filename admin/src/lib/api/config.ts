/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// API Base URL - can be configured via environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    updateProfile: '/api/auth/update-profile',
    changePassword: '/api/auth/change-password',
    me: '/api/auth/me',
  },
  users: {
    profile: '/api/users/profile',
    orders: '/api/users/orders',
    orderDetail: (id: string) => `/api/users/orders/${id}`,
    appointments: '/api/users/appointments',
    appointmentDetail: (id: string) => `/api/users/appointments/${id}`,
  },
  doctors: {
    list: '/api/doctors',
    detail: (id: string) => `/api/doctors/${id}`,
    profile: '/api/doctors/profile',
    appointments: '/api/doctors/appointments',
    appointmentDetail: (id: string) => `/api/doctors/appointments/${id}`,
    updateAppointment: (id: string) => `/api/doctors/appointments/${id}`,
  },
  admin: {
    products: {
      list: '/api/admin/products',
      detail: (id: string) => `/api/admin/products/${id}`,
      create: '/api/admin/products',
      update: (id: string) => `/api/admin/products/${id}`,
      delete: (id: string) => `/api/admin/products/${id}`,
    },
  },
} as const;

// Token storage keys
export const STORAGE_KEYS = {
  accessToken: 'homeopatha_access_token',
  refreshToken: 'homeopatha_refresh_token',
  tokenExpiry: 'homeopatha_token_expiry',
  user: 'homeopatha_user',
} as const;

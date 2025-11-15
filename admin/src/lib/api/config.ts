/**
 * API Configuration
 * Central configuration for API endpoints and settings
 */

// API Base URL - can be configured via environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.homeopatha.hetsaraiya.com';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refreshToken: '/api/auth/refresh-token',
    activity: '/api/auth/activity',
  },
  users: {
    me: '/api/users/me',
    list: '/api/users',
    detail: (id: string) => `/api/users/${id}`,
    update: (id: string) => `/api/users/${id}`,
    delete: '/api/users',
  },
} as const;

// Token storage keys
export const STORAGE_KEYS = {
  accessToken: 'homeopatha_access_token',
  refreshToken: 'homeopatha_refresh_token',
  tokenExpiry: 'homeopatha_token_expiry',
  user: 'homeopatha_user',
} as const;

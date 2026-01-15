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
  doctors: {
    list: '/api/doctors',
    detail: (id: string) => `/api/doctors/${id}`,
  },
  products: {
    list: '/api/products',
    detail: (id: string) => `/api/products/${id}`,
  },
  blogs: {
    list: '/api/blogs',
    detail: (id: string) => `/api/blogs/${id}`,
    bySlug: (slug: string) => `/api/blogs/slug/${slug}`,
    featured: '/api/blogs/featured',
    tags: '/api/blogs/tags',
  },
} as const;

// Token storage keys
export const STORAGE_KEYS = {
  accessToken: 'homeopatha_access_token',
  user: 'homeopatha_user',
} as const;

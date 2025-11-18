/**
 * Authentication Hook
 * Custom hook for using authentication in components
 * 
 * Note: DO NOT call store.initialize() here. 
 * Initialization is handled by AuthProvider only.
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const loginAndRedirect = useCallback(async (email: string, password: string) => {
    try {
      await store.login({ email, password });
      router.push('/admin');
    } catch (error) {
      // Error is already in store.error
      throw error;
    }
  }, [store, router]);

  const logoutAndRedirect = useCallback(async () => {
    try {
      await store.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [store, router]);

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    loginAndRedirect,
    logoutAndRedirect,
  };
}

export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // Check auth status and redirect if needed
  if (typeof window !== 'undefined' && !isLoading && !isAuthenticated) {
    router.push(redirectUrl);
  }

  return {
    isAuthenticated,
    isLoading,
  };
}

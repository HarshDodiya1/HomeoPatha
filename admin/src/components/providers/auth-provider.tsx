/**
 * Auth Provider
 * Client-side authentication provider component
 * 
 * Handles single initialization of auth state from localStorage on app startup.
 * This is the ONLY place where initialize() should be called.
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state from localStorage exactly once on app startup
    const store = useAuthStore.getState();
    store.initialize();
  }, []); // Empty dependency array - runs once on mount

  return <>{children}</>;
}

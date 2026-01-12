/**
 * Protected Route Component
 * Wrapper component that requires authentication
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, accessToken } = useAuthStore();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Wait for initialization to complete, then check auth
    if (isInitialized && !isLoading && !isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, isInitialized, redirectTo, router, hasRedirected]);

  // Also check if there's a token mismatch (persisted state says authenticated but no token)
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && isAuthenticated && !accessToken) {
      // State mismatch - clear and redirect
      localStorage.removeItem('auth-storage');
      router.push(redirectTo);
    }
  }, [isInitialized, isAuthenticated, accessToken, redirectTo, router]);

  // Show loading while initialization is in progress
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated after initialization, don't render (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

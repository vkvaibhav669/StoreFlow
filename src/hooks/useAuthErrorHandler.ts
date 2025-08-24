import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthError } from '@/lib/api';

/**
 * Hook to handle authentication errors globally
 * Redirects to login page when authentication fails
 */
export function useAuthErrorHandler() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleAuthError = async (error: any) => {
    if (error instanceof AuthError || 
        (error && (error.status === 401 || error.status === 403))) {
      console.warn('Authentication error detected, signing out user:', error.message);
      
      try {
        await signOut();
      } catch (signOutError) {
        console.error('Error during automatic sign out:', signOutError);
        // Force redirect even if signOut fails
        router.push('/auth/signin');
      }
    }
  };

  return { handleAuthError };
}

/**
 * Global error boundary hook for API calls
 * Use this in components that make API calls to automatically handle auth errors
 */
export function useApiErrorHandler() {
  const { handleAuthError } = useAuthErrorHandler();

  const wrapApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      await handleAuthError(error);
      throw error; // Re-throw to allow component-level error handling
    }
  };

  return { wrapApiCall };
}
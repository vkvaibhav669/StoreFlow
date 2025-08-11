
'use client'; // To use localStorage

import type { User } from '@/types';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';
const TOKEN_STORAGE_KEY = 'storeflow_auth_token';

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error("Error parsing current user from localStorage", e);
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
      return null;
    }
  }
  return null;
}

function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  }
}

function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  // Note: Sign up API is not implemented yet. This would require a separate endpoint.
  // For now, keeping the basic validation logic but throwing an error.
  throw new Error("Sign up functionality needs to be implemented with a dedicated API endpoint.");
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store both user and token
    setCurrentUser(data.user);
    setAuthToken(data.token);

    return data.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    const token = getAuthToken();
    
    if (token) {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout API error:', error);
    // Continue with local cleanup even if API call fails
  }

  // Clear local storage
  setCurrentUser(null);
  setAuthToken(null);
}

// Get auth token for API calls
export function getAuthTokenForAPI(): string | null {
  return getAuthToken();
}


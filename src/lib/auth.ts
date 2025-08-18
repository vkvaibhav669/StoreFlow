
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment.

'use client'; // To use localStorage

import type { User } from '@/types';
import config from '@/lib/config';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';

const TOKEN_STORAGE_KEY = 'storeflow_auth_token';





// Mock users with Indian names and roles
// Password "TestAdmin@123" will work for the specified dummy accounts in this mock setup.
const mockUsers: User[] = [
  { id: 'user-001', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Admin' },
  { id: 'user-002', name: 'Rohan Mehra', email: 'rohan.mehra@example.com', role: 'Member' },
   // Added dummy logins as per request:
  { id: '592f0e9b1c2e4e5a4c0b9769', name: 'Parag Shah (SA)', email: 'parag@hk.co', role: 'SuperAdmin'},
  { id: '892f0e9b1c6e4e5a9c0b9669', name: 'Manish Kemani (SA)', email: 'manish@kisna.com', role: 'SuperAdmin' },
  { id: '292f0e3b1c6e4e5a9c0b9669', name: 'Trisha Paul (SA)', email: 'trisha.p@kisna.com', role: 'SuperAdmin' },
  { id: '192f0e3b2c6e4e7a9c0b9669', name: 'Seema Gawade (SA)', email: 'seema@kisna.com', role: 'SuperAdmin' },
  { id: '172f0e8b2c1e4e3a9c0b4661', name: 'Anita Stany Serrao (SA)', email: 'anita.d@kisna.com', role: 'SuperAdmin' },
  { id: '662f0e9b2c1e4e2a9c0b4666', name: 'Ruvin (SA)', email: 'ruvin@kisna.com', role: 'SuperAdmin' },

  { id: '669f0e6b4c1e4e1a9c8b4597', name: 'Alpesh Dholakiya (SA)', email: 'alpesh@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e5b4c1e4e3a9c8b4547', name: 'Sanket Lakhani (SA)', email: 'sanket.l@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e4b4c1e4e5a9c8b4567', name: 'Chandresh Gor (SA)', email: 'chandresh.g@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e3b4c1e4e1a9c8b4567', name: 'Mayur  (SA)', email: 'mayur.b@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e2b4c1e4e7a9c8b4567', name: 'Saideep (SA)', email: 'saideep.m_old@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e1b4c1e4e2a9c8b4567', name: 'Janak P (SA)', email: 'janakp@kisna.com', role: 'SuperAdmin' },
  { id: '162f0e0b2c1e4e3a9c0b4667', name: 'Ashish Shrivastava (SA)', email: 'ashish.shrivastava@kisna.com', role: 'SuperAdmin' },
  { id: '162f0e0b2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin' },
   { id: '16g0e0b2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin' },
    { id: '162re0b2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin' },
     { id: '162f0ub2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin' },
     
];


export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  console.log("Retrieving current user from localStorage");
  // Retrieve the current user from localStorage
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
    console.log("Current user set in localStorage:", user);
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

export function getAuthToken(): string | null {
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
    const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
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
    setCurrentUser(data.name);
    setAuthToken(data.token);
    console.log('Login response:', data);

    console.log("User signed in successfully:", data.name);
    return data.name;
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
      await fetch(`${config.apiBaseUrl}/api/auth/logout`, {
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

// Check if user is authenticated (has both token and user data)
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
}


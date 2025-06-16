
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment.
'use client'; // To use localStorage

import type { User, UserRole } from '@/types';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';
const API_BASE_URL = '/api'; // Assuming API routes are in the same Next.js app

// Helper function for API requests (specific to auth if needed, or use a global one)
async function fetchAuthAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }
    if (response.status === 204) return undefined as T;
    return response.json() as T;
  } catch (error) {
    console.error(`Auth API call to ${endpoint} failed:`, error);
    throw error;
  }
}


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

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const lowerEmail = email.toLowerCase();
  // In a real app, the API would handle user creation and password hashing.
  // The API would return the new user object (without passwordHash).
  const newUser = await fetchAuthAPI<User>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email: lowerEmail, password }),
  });
  setCurrentUser(newUser);
  return newUser;
}

export async function signIn(email: string, password: string): Promise<User> {
  const lowerEmail = email.toLowerCase();
  // The API would validate credentials and return the user object or an error.
  const user = await fetchAuthAPI<User>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email: lowerEmail, password }),
  });
  setCurrentUser(user);
  return user;
}

export async function signOut(): Promise<void> {
  // Inform the backend about sign-out if necessary (e.g., to invalidate a session/token)
  // For a simple mock, just clearing local state is enough.
  // await fetchAuthAPI<void>('/auth/signout', { method: 'POST' }); // Example
  setCurrentUser(null);
  return Promise.resolve();
}

// This function would now fetch from your /api/users endpoint
export async function getAllMockUsers(): Promise<User[]> {
  // This function is less relevant if users are managed by a proper auth system + DB.
  // If you need a list of users for assignment, your API should provide an endpoint for that.
  // For now, it can return an empty array or be removed if not used by UI directly.
  // Example: return await fetchAuthAPI<User[]>('/users/list-for-assignment');
  console.warn("getAllMockUsers is a mock function and should be replaced with an API call if user listing is needed.");
  return Promise.resolve([]);
}

// The hardcoded test users from the previous `auth.ts` would now typically be
// created via your application's sign-up flow or seeded directly into your MongoDB
// database by your backend setup scripts.
// The frontend no longer manages the user list directly.
    
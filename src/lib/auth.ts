
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment.
'use client'; // To use localStorage

import type { User, UserRole } from '@/types';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';

// Mock users with Indian names and roles
const mockUsers: User[] = [
  { id: 'user-001', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Admin' },
  { id: 'user-002', name: 'Rohan Mehra', email: 'rohan.mehra@example.com', role: 'Member' },
  { id: 'user-003', name: 'Aisha Khan', email: 'aisha.khan@example.com', role: 'SuperAdmin' },
  { id: 'user-004', name: 'Vikram Singh', email: 'vikram.singh@example.com', role: 'Member' },
  { id: 'user-005', name: 'Neha Patel', email: 'neha.patel@example.com', role: 'Admin' },
];

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
  if (mockUsers.find(u => u.email === lowerEmail)) {
    throw new Error("User with this email already exists.");
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email: lowerEmail,
    role: 'Member', // Default role for new sign-ups
  };
  mockUsers.push(newUser);
  setCurrentUser(newUser);
  return Promise.resolve(newUser);
}

export async function signIn(email: string, password: string): Promise<User> {
  const lowerEmail = email.toLowerCase();
  const user = mockUsers.find(u => u.email === lowerEmail);
  // Mock password check - in a real app, this would be a hashed password comparison
  if (user && password) { // For mock, any non-empty password for a known email works
    setCurrentUser(user);
    return Promise.resolve(user);
  }
  throw new Error("Invalid email or password.");
}

export async function signOut(): Promise<void> {
  setCurrentUser(null);
  return Promise.resolve();
}

export function getAllMockUsers(): User[] {
  return [...mockUsers];
}

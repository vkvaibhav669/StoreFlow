
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment. Passwords are stored in plaintext.
'use client'; // To use localStorage

import type { User } from '@/types';

const USERS_STORAGE_KEY = 'storeflow_mock_users';
const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';

// Admin user details
const ADMIN_EMAIL = 'vaibhhavrajkumar@gmail.com';
const ADMIN_PASSWORD = '70669$RRSVk'; // In a real app, NEVER store plaintext passwords
const ADMIN_NAME = 'Vaibhhav Raj Kumar';

interface StoredUser extends User {
  passwordHash: string; // In a real app, this would be a proper hash
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      const users = getStoredUsers();
      if (users.find(u => u.email === email) || email === ADMIN_EMAIL) {
        reject(new Error('User already exists with this email.'));
        return;
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user',
        passwordHash: password, // Storing plaintext password - MOCK ONLY
      };
      users.push(newUser);
      saveStoredUsers(users);
      
      const { passwordHash, ...userToReturn } = newUser;
      setCurrentUser(userToReturn);
      resolve(userToReturn);
    }, 500);
  });
}

export async function signIn(email: string, password: string): Promise<User> {
   return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          id: 'admin-001',
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: 'admin',
        };
        setCurrentUser(adminUser);
        resolve(adminUser);
        return;
      }

      const users = getStoredUsers();
      const storedUser = users.find(u => u.email === email);

      if (!storedUser) {
        reject(new Error('Invalid email or password.'));
        return;
      }

      // In a real app, compare hashed passwords securely
      if (storedUser.passwordHash !== password) {
        reject(new Error('Invalid email or password.'));
        return;
      }
      
      const { passwordHash, ...userToReturn } = storedUser;
      setCurrentUser(userToReturn);
      resolve(userToReturn);
    }, 500);
  });
}

export async function signOut(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => { // Simulate network delay
      setCurrentUser(null);
      resolve();
    }, 300);
  });
}

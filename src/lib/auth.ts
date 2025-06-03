
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment. Passwords are stored in plaintext.
'use client'; // To use localStorage

import type { User } from '@/types';

const USERS_STORAGE_KEY = 'storeflow_mock_users';
const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';

// Admin user details - Updated to Indian names
const ADMIN_EMAIL = 'priya.verma@storeflow.corp';
const ADMIN_PASSWORD = '70669$RRSVk'; // In a real app, NEVER store plaintext passwords
const ADMIN_NAME = 'Priya Verma';

// Pre-seeded test user details - Updated to Indian names
const PRESEEDED_TEST_USER_EMAIL = "karan.malhotra@storeflow.corp";
const PRESEEDED_TEST_USER_PASSWORD = "70669$RRSVk";
const PRESEEDED_TEST_USER_NAME = "Karan Malhotra (Test User)";


interface StoredUser extends User {
  passwordHash: string; // In a real app, this would be a proper hash
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  let users: StoredUser[] = [];

  if (usersJson) {
    try {
      users = JSON.parse(usersJson);
    } catch (e) {
      console.error("Error parsing users from localStorage", e);
      localStorage.removeItem(USERS_STORAGE_KEY); // Clear corrupted data
      users = []; // Start fresh
    }
  }

  // Ensure the pre-seeded test user exists in the list
  const testUserExists = users.some(u => u.email === PRESEEDED_TEST_USER_EMAIL);
  if (!testUserExists) {
    users.push({
      id: 'user-test-001', // Static ID for this pre-seeded test user
      name: PRESEEDED_TEST_USER_NAME,
      email: PRESEEDED_TEST_USER_EMAIL,
      passwordHash: PRESEEDED_TEST_USER_PASSWORD, // Storing plaintext - MOCK ONLY
      role: 'user',
    });
    saveStoredUsers(users); // Save the updated list including the new test user
  }

  return users;
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
      const users = getStoredUsers(); // This will now ensure the test user might already exist
      if (users.find(u => u.email === email) || email === ADMIN_EMAIL) {
        // Check if trying to sign up with admin email or an existing pre-seeded test user email
        if (email === ADMIN_EMAIL || email === PRESEEDED_TEST_USER_EMAIL) {
            const existingUser = users.find(u => u.email === email);
            if (existingUser && existingUser.passwordHash !== password) {
                 // Allow sign-up if it's the pre-seeded user and password differs (e.g. "forgot password" scenario for mock)
                 // Or if it's admin email but not admin password - this case is tricky, usually admin can't be "signed up"
            } else {
                reject(new Error('User already exists with this email.'));
                return;
            }
        } else if (users.find(u => u.email === email)) {
             reject(new Error('User already exists with this email.'));
             return;
        }
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user',
        passwordHash: password, // Storing plaintext password - MOCK ONLY
      };
      
      // Avoid adding duplicate if somehow this logic is reached for pre-seeded user
      const userIndex = users.findIndex(u => u.email === email);
      if (userIndex > -1) {
          users[userIndex] = newUser; // Overwrite if email matches (e.g. for password "reset" via signup)
      } else {
          users.push(newUser);
      }
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

      const users = getStoredUsers(); // This ensures our pre-seeded user is in the `users` array
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


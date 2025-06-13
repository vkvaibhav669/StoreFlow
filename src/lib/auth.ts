// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment. Passwords are stored in plaintext.
'use client'; // To use localStorage

import type { User, UserRole } from '@/types';

const USERS_STORAGE_KEY = 'storeflow_mock_users';
const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';

// Original Admin user - now SuperAdmin
const OG_ADMIN_EMAIL = 'priya.verma@storeflow.corp';
const OG_ADMIN_PASSWORD = '70669$RRSVk';
const OG_ADMIN_NAME = 'Priya Verma';

// Provided test users
const SUPER_ADMIN_EMAIL_TEST = 'vaibhhavrajkumar@gmail.com';
const ADMIN_EMAIL_TEST = 'vaibhavvrajkumar@gmail.com';
const MEMBER_EMAIL_TEST = 'vkvaibhav36@gmail.com';
const COMMON_TEST_PASSWORD = 'TestAdmin@7669';


// Pre-seeded regular test user (will become a Member if not one of the above)
const PRESEEDED_REGULAR_USER_EMAIL = "karan.malhotra@storeflow.corp";
const PRESEEDED_REGULAR_USER_PASSWORD = "70669$RRSVk"; // Can be same as OG_ADMIN_PASSWORD or different
const PRESEEDED_REGULAR_USER_NAME = "Karan Malhotra (Test User)";


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
      localStorage.removeItem(USERS_STORAGE_KEY); 
      users = []; 
    }
  }

  // Ensure specific test users exist with correct roles
  const ensureUser = (email: string, name: string, role: UserRole, passwordHash: string) => {
    const existingUserIndex = users.findIndex(u => u.email === email);
    if (existingUserIndex !== -1) {
      // Update existing user if role or other details need to be enforced
      users[existingUserIndex] = { ...users[existingUserIndex], name, role, passwordHash };
    } else {
      users.push({ id: `user-${email}-${Date.now()}`.slice(0,20), name, email, role, passwordHash });
    }
  };

  ensureUser(OG_ADMIN_EMAIL, OG_ADMIN_NAME, 'SuperAdmin', OG_ADMIN_PASSWORD);
  ensureUser(SUPER_ADMIN_EMAIL_TEST, 'Vaibhav Rajkumar (SA)', 'SuperAdmin', COMMON_TEST_PASSWORD);
  ensureUser(ADMIN_EMAIL_TEST, 'Vaibhav V Rajkumar (Admin)', 'Admin', COMMON_TEST_PASSWORD);
  ensureUser(MEMBER_EMAIL_TEST, 'VK Vaibhav (Member)', 'Member', COMMON_TEST_PASSWORD);
  
  // Ensure the pre-seeded regular test user exists as a Member
  const regularTestUserExists = users.some(u => u.email === PRESEEDED_REGULAR_USER_EMAIL);
  if (!regularTestUserExists) {
    users.push({
      id: 'user-karan-test-001',
      name: PRESEEDED_REGULAR_USER_NAME,
      email: PRESEEDED_REGULAR_USER_EMAIL,
      passwordHash: PRESEEDED_REGULAR_USER_PASSWORD,
      role: 'Member', // Default role for this pre-seeded user
    });
  }
  
  saveStoredUsers(users);
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

// Function to get all users (useful for SuperAdmin tasks, though not implemented in UI yet)
// This is a mock function; in a real app, this would be a protected API endpoint.
export function getAllMockUsers(): User[] {
  const storedUsers = getStoredUsers();
  return storedUsers.map(({ passwordHash, ...user }) => user);
}


export async function signUp(name: string, email: string, password: string): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => { 
      const users = getStoredUsers();
      if (users.find(u => u.email === email)) {
        reject(new Error('User already exists with this email.'));
        return;
      }

      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'Member', // New sign-ups default to Member role
        passwordHash: password, 
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
    setTimeout(() => {
      const users = getStoredUsers(); // Ensures all test users are loaded
      const storedUser = users.find(u => u.email === email);

      if (!storedUser) {
        reject(new Error('Invalid email or password.'));
        return;
      }

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
    setTimeout(() => { 
      setCurrentUser(null);
      resolve();
    }, 300);
  });
}
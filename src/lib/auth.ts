
// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment.
'use client'; // To use localStorage

import type { User, UserRole, Department } from '@/types';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';




// Mock users with Indian names and roles
// Password "TestAdmin@123" will work for the specified dummy accounts in this mock setup.
const mockUsers: User[] = [
  { id: 'user-001', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'Admin', department: 'Project' },
  { id: 'user-002', name: 'Rohan Mehra', email: 'rohan.mehra@example.com', role: 'Member', department: 'Marketing' },
   // Added dummy logins as per request:
  { id: '592f0e9b1c2e4e5a4c0b9769', name: 'Parag Shah (SA)', email: 'parag@hk.co', role: 'SuperAdmin', department: 'Executive Office'},
  { id: '892f0e9b1c6e4e5a9c0b9669', name: 'Manish Kemani (SA)', email: 'manish@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '292f0e3b1c6e4e5a9c0b9669', name: 'Trisha Paul (SA)', email: 'trisha.p@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '192f0e3b2c6e4e7a9c0b9669', name: 'Seema Gawade (SA)', email: 'seema@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '172f0e8b2c1e4e3a9c0b4661', name: 'Anita Stany Serrao (SA)', email: 'anita.d@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '662f0e9b2c1e4e2a9c0b4666', name: 'Ruvin (SA)', email: 'ruvin@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '662f0e7b2c1e4e3a9c8b4669', name: 'Vaibhhav Rajkumar (SA)', email: 'vaibhhavrajkumar@gmail.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e6b4c1e4e1a9c8b4597', name: 'Alpesh Dholakiya (SA)', email: 'alpesh@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e5b4c1e4e3a9c8b4547', name: 'Sanket Lakhani (SA)', email: 'sanket.l@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e4b4c1e4e5a9c8b4567', name: 'Chandresh Gor (SA)', email: 'chandresh.g@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e3b4c1e4e1a9c8b4567', name: 'Mayur  (SA)', email: 'mayur.b@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e2b4c1e4e7a9c8b4567', name: 'Saideep (SA)', email: 'saideep.m_old@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '669f0e1b4c1e4e2a9c8b4567', name: 'Janak P (SA)', email: 'janakp@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '162f0e0b2c1e4e3a9c0b4667', name: 'Ashish Shrivastava (SA)', email: 'ashish.shrivastava@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
  { id: '162f0e0b2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin', department: 'Executive Office' },
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
  // For these mock users, any non-empty password will work with the specified emails.
  if (user && password) { 
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

export async function registerUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    department?: Department;
    password?: string;
}): Promise<User> {
    const lowerEmail = userData.email.toLowerCase();
    if (mockUsers.find(u => u.email === lowerEmail)) {
        throw new Error("A user with this email already exists.");
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: lowerEmail,
        role: userData.role,
        department: userData.department,
    };
    mockUsers.push(newUser);
    // Note: We don't automatically sign in the newly created user.
    // An admin creates them, but they need to sign in themselves.
    return Promise.resolve(newUser);
}

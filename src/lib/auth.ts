// IMPORTANT: This is a MOCK authentication system for prototyping.
// DO NOT use this in a production environment.
'use client'; // To use localStorage

import type { User, UserRole } from '@/types';
import { Users } from 'lucide-react';

const CURRENT_USER_STORAGE_KEY = 'storeflow_current_user';




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
  { id: '662f0e7b2c1e4e3a9c8b4669', name: 'Vaibhhav Rajkumar (SA)', email: 'vaibhhavrajkumar@gmail.com', role: 'SuperAdmin' },
  { id: '669f0e6b4c1e4e1a9c8b4597', name: 'Alpesh Dholakiya (SA)', email: 'alpesh@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e5b4c1e4e3a9c8b4547', name: 'Sanket Lakhani (SA)', email: 'sanket.l@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e4b4c1e4e5a9c8b4567', name: 'Chandresh Gor (SA)', email: 'chandresh.g@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e3b4c1e4e1a9c8b4567', name: 'Mayur  (SA)', email: 'mayur.b@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e2b4c1e4e7a9c8b4567', name: 'Saideep (SA)', email: 'saideep.m_old@kisna.com', role: 'SuperAdmin' },
  { id: '669f0e1b4c1e4e2a9c8b4567', name: 'Janak P (SA)', email: 'janakp@kisna.com', role: 'SuperAdmin' },
  { id: '162f0e0b2c1e4e3a9c0b4667', name: 'Ashish Shrivastava (SA)', email: 'ashish.shrivastava@kisna.com', role: 'SuperAdmin' },
  { id: '162f0e0b2c1e4e3a9c0b4444', name: 'Vipin Saini (SA)', email: 'vipin.s@kisna.com', role: 'SuperAdmin' },
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

  // Call your real API endpoint for login
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: lowerEmail, password }),
  });

  const data = await response.json();
  console.log("Sign in response:", data);
  if (!response.ok) {
    throw new Error(data.message || "Invalid email or password.");
  }

  // Store token for authenticated requests
  if (data.token) {
    localStorage.setItem("auth_token", data.token);
  }

  // Build user object from API response
  const user: User = {
    id: data._id || data.id,
    name: data.name,
    email: data.email,
    role: data.role,
  };
  setCurrentUser(user);
  return user;
}

export async function signOut(): Promise<void> {
  setCurrentUser(null);
  return Promise.resolve();
}

export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Optionally add Authorization header if needed:
      // "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users.");
  }

  const data = await response.json();
  // Ensure the result is an array of User objects
  return Array.isArray(data)
    ? data.map((u) => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }))
    : [];
}


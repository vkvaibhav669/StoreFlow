
"use client";

import type { User } from "@/types";
import * as authService from "@/lib/auth";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (name: string, email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const currentUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      // Only set user if they are properly authenticated (both user data and token exist)
      if (isAuth && currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        // Clear any partial auth data
        if (currentUser && !isAuth) {
          authService.signOut().catch(console.error);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const signedInUser = await authService.signIn(email, password);
      setUser(signedInUser);
      
      // Add a small delay to ensure token is properly stored before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setLoading(false);
      return signedInUser;
    } catch (error) {
      console.error("Sign in failed:", error);
      setUser(null);
      setLoading(false);
      throw error; // Re-throw for the form to handle
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const signedUpUser = await authService.signUp(name, email, password);
      setUser(signedUpUser);
      setLoading(false);
      return signedUpUser;
    } catch (error) {
      console.error("Sign up failed:", error);
      setUser(null);
      setLoading(false);
      throw error; // Re-throw for the form to handle
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setLoading(false);
      router.push("/auth/signin"); // Redirect after sign out
    } catch (error) {
      console.error("Sign out failed:", error);
      // Even if sign out fails, clear local state and redirect
      setUser(null);
      setLoading(false);
      router.push("/auth/signin");
    }
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

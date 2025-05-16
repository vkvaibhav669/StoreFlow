
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const signedInUser = await authService.signIn(email, password);
      setUser(signedInUser);
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
      setLoading(false); // Still set loading to false on error
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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

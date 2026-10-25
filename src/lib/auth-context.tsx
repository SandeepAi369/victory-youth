"use client";

import React, { createContext, useContext } from "react";
import { User } from "@/types";
import { logoutAction } from "@/app/login/actions";

/**
 * Admin access is a single shared password (see /login and app/admin/layout.tsx),
 * so there is one generic admin identity — no per-person demo accounts.
 */
const ADMIN_USER: User = {
  id: "admin",
  name: "Admin",
  phone: "",
  role: "SUPER_ADMIN",
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: string;
  logout: () => void;
  hasRole: (...args: unknown[]) => boolean;
  hasPermission: (...args: unknown[]) => boolean;
  can: (...args: unknown[]) => boolean;
}

function logout() {
  // Session cookie is httpOnly, so it can only be cleared on the server
  void logoutAction();
}

const allow = () => true;

export const AuthContext = createContext<AuthContextType>({
  user: ADMIN_USER,
  isAuthenticated: true,
  currentRole: "SUPER_ADMIN",
  logout,
  hasRole: allow,
  hasPermission: allow,
  can: allow,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: ADMIN_USER,
        isAuthenticated: true,
        currentRole: "SUPER_ADMIN",
        logout,
        hasRole: allow,
        hasPermission: allow,
        can: allow,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;

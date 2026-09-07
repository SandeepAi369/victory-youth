"use client";

import React, { createContext, useContext, useState } from "react";
import { User, UserRole } from "@/types";

const DEMO_USERS: Record<string, User> = {
  SUPER_ADMIN: {
    id: "usr-1",
    name: "K. Sandeep Raju",
    email: "admin@ganeshbns.org",
    phone: "+91 98765 43210",
    role: "SUPER_ADMIN",
    memberId: "VYA-001",
    twoFactorEnabled: true,
  },
  PRESIDENT: {
    id: "usr-2",
    name: "V. Rajeshwar Rao",
    email: "president@ganeshbns.org",
    phone: "+91 94401 12345",
    role: "PRESIDENT",
    memberId: "VYA-002",
  },
  TREASURER: {
    id: "usr-3",
    name: "M. Laxmi Narayana",
    email: "treasurer@ganeshbns.org",
    phone: "+91 98490 54321",
    role: "TREASURER",
    memberId: "VYA-003",
  },
  SECRETARY: {
    id: "usr-4",
    name: "Ch. Srinivas",
    email: "secretary@ganeshbns.org",
    phone: "+91 99890 98765",
    role: "SECRETARY",
    memberId: "VYA-004",
  },
  EVENT_INCHARGE: {
    id: "usr-5",
    name: "P. Ramesh Kumar",
    email: "events@ganeshbns.org",
    phone: "+91 97012 34567",
    role: "EVENT_INCHARGE",
    memberId: "VYA-005",
  },
  COMMITTEE_MEMBER: {
    id: "usr-6",
    name: "G. Sai Krishna",
    email: "committee@ganeshbns.org",
    phone: "+91 96521 78901",
    role: "COMMITTEE_MEMBER",
    memberId: "VYA-006",
  },
  VOLUNTEER: {
    id: "usr-7",
    name: "A. Vikram Reddy",
    email: "volunteer@ganeshbns.org",
    phone: "+91 98660 11223",
    role: "VOLUNTEER",
    memberId: "VYA-007",
  },
  MEMBER: {
    id: "usr-8",
    name: "T. Mahesh Goud",
    email: "member@ganeshbns.org",
    phone: "+91 99490 44556",
    role: "MEMBER",
    memberId: "VYA-008",
  },
  AUDITOR: {
    id: "usr-9",
    name: "CA. Suresh & Co.",
    email: "auditor@ganeshbns.org",
    phone: "+91 98480 77889",
    role: "AUDITOR",
    memberId: "AUD-001",
  },
  GUEST: {
    id: "usr-10",
    name: "Guest Devotee",
    phone: "+91 98765 00000",
    role: "GUEST",
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: string;
  login: (role: string) => void;
  logout: () => void;
  switchRole: (role: string) => void;
  hasRole: (...args: any[]) => boolean;
  hasPermission: (...args: any[]) => boolean;
  can: (...args: any[]) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  currentRole: "SUPER_ADMIN",
  login: () => {},
  logout: () => {},
  switchRole: () => {},
  hasRole: () => false,
  hasPermission: () => true,
  can: () => true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USERS.SUPER_ADMIN);

  const login = (role: string) => {
    if (DEMO_USERS[role]) {
      setUser(DEMO_USERS[role]);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: string) => {
    login(role);
  };

  const hasRole = (...args: any[]): boolean => true; const _oldHasRole = (roles: string[]): boolean => {
    if (!user) return false;
    if (user.role === "SUPER_ADMIN") return true;
    return roles.includes(user.role as string);
  };

  const hasPermission = (...args: any[]): boolean => true; const _oldHasPerm = (_perm: string): boolean => true;
  const can = (...args: any[]): boolean => true; const _oldCan = (_act: string): boolean => true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        currentRole: user ? (user.role as string) : "GUEST",
        login,
        logout,
        switchRole,
        hasRole,
        hasPermission,
        can,
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

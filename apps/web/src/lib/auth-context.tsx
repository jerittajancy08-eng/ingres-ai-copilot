"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import type { User, UserRole } from "@/types/api";

const ROLE_LEVELS: Record<UserRole, number> = {
  user: 1,
  admin: 2,
};

export function canAccessRole(userRole: UserRole | undefined, requiredRole: UserRole) {
  return Boolean(userRole && ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]);
}

type AuthContextValue = {
  user?: User;
  isLoading: boolean;
  setUser: (user?: User) => void;
  hasRole: (role: UserRole) => boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }

    api.me()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(undefined);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    setUser,
    hasRole: (role) => canAccessRole(user?.role, role),
    logout: async () => {
      await api.logout().catch(() => undefined);
      clearToken();
      setUser(undefined);
    },
  }), [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function RoleGuard({ minRole, children }: { minRole: UserRole; children: ReactNode }) {
  const router = useRouter();
  const { hasRole, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !hasRole(minRole))) {
      router.replace("/");
    }
  }, [hasRole, isLoading, minRole, router, user]);

  if (isLoading || !user || !hasRole(minRole)) return null;

  return <>{children}</>;
}

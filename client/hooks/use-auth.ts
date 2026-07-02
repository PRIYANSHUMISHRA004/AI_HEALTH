"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { authService } from "@/services";
import { useAuthStore } from "@/store";
import type { AuthUser } from "@/types";

let currentUserRequest: Promise<AuthUser | null> | null = null;

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const syncCurrentUser = useCallback(async () => {
    if (!token) {
      clearSession();
      return null;
    }

    if (currentUserRequest) {
      return currentUserRequest;
    }

    currentUserRequest = authService
      .me(token)
      .then((user) => {
        updateUser(user);
        return user;
      })
      .catch(() => {
        clearSession();
        return null;
      })
      .finally(() => {
        currentUserRequest = null;
      });

    try {
      return await currentUserRequest;
    } finally {
      if (!token) {
        currentUserRequest = null;
      }
    }
  }, [clearSession, token, updateUser]);

  const logout = useCallback(() => {
    currentUserRequest = null;
    clearSession();
    router.push("/login");
  }, [clearSession, router]);

  return {
    user,
    token,
    isAuthenticated,
    isHydrated,
    logout,
    syncCurrentUser,
    updateUser,
  };
}

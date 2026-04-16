"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthSession, AuthUser } from "@/types";

interface AuthStore extends AuthSession {
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (user: AuthUser) => void;
  setHydrated: (value: boolean) => void;
  clearSession: () => void;
}

const initialSession: AuthSession = {
  user: null,
  token: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialSession,
      isAuthenticated: false,
      isHydrated: false,
      setSession: ({ user, token }) =>
        set({
          user,
          token,
          isAuthenticated: Boolean(user && token),
        }),
      updateUser: (user) =>
        set((state) => ({
          user,
          token: state.token,
          isAuthenticated: Boolean(user && state.token),
        })),
      setHydrated: (value) => set({ isHydrated: value }),
      clearSession: () =>
        set({
          ...initialSession,
          isAuthenticated: false,
          isHydrated: true,
        }),
    }),
    {
      name: "carebridge-auth",
      partialize: ({ user, token, isAuthenticated }) => ({
        user,
        token,
        isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

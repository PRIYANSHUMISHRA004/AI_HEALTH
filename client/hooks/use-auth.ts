"use client";

import { useRouter } from "next/navigation";

import { authService } from "@/services";
import { useAuthStore } from "@/store";

export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  const syncCurrentUser = async () => {
    if (!store.token) {
      store.clearSession();
      return null;
    }

    try {
      const user = await authService.me(store.token);
      store.updateUser(user);
      return user;
    } catch {
      store.clearSession();
      return null;
    }
  };

  const logout = () => {
    store.clearSession();
    router.push("/login");
  };

  return {
    ...store,
    logout,
    syncCurrentUser,
  };
}

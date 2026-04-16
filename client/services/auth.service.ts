import { apiClient } from "@/lib/api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types";

const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const authService = {
  login: (payload: LoginPayload) => apiClient.post<AuthResponse, LoginPayload>("/api/auth/login", payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse, RegisterPayload>("/api/auth/register", payload),
  me: (token: string) => apiClient.get<AuthResponse["user"]>("/api/auth/me", withAuth(token)),
};

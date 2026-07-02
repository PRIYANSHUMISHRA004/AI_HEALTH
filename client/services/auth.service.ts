import { apiClient } from "@/lib/api";
import type { AuthResponse, LoginPayload, RegisterPayload } from "@/types";

const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  linkedHospitalId?: string;
}

export const authService = {
  login: (payload: LoginPayload) => apiClient.post<AuthResponse, LoginPayload>("/api/auth/login", payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse, RegisterPayload>("/api/auth/register", payload),
  me: (token: string) => apiClient.get<AuthResponse["user"]>("/api/auth/me", withAuth(token)),
  updateProfile: (payload: UpdateProfilePayload, token: string) =>
    apiClient.patch<AuthResponse["user"], UpdateProfilePayload>("/api/auth/me", payload, withAuth(token)),
};

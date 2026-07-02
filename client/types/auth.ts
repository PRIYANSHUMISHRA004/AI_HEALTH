import type { UserRole } from "@/types/entities";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  linkedHospitalId?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  token: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  linkedHospitalId?: string;
  hospitalName?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

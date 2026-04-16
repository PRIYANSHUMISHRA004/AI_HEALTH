import { apiClient } from "@/lib/api";
import type {
  AppointmentAnalytics,
  EquipmentAnalytics,
  IssueAnalytics,
  OverviewAnalytics,
} from "@/types";

const withHospitalId = (hospitalId?: string) =>
  hospitalId ? `?hospitalId=${encodeURIComponent(hospitalId)}` : "";

export const analyticsService = {
  getOverview: async (token: string, hospitalId?: string) =>
    apiClient.get<OverviewAnalytics>(`/api/analytics/overview${withHospitalId(hospitalId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  getEquipment: async (token: string, hospitalId?: string) =>
    apiClient.get<EquipmentAnalytics>(`/api/analytics/equipment${withHospitalId(hospitalId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  getIssues: async (token: string, hospitalId?: string) =>
    apiClient.get<IssueAnalytics>(`/api/analytics/issues${withHospitalId(hospitalId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  getAppointments: async (token: string, hospitalId?: string) =>
    apiClient.get<AppointmentAnalytics>(`/api/analytics/appointments${withHospitalId(hospitalId)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
};

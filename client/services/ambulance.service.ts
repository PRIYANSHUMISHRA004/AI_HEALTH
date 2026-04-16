import { apiClient } from "@/lib/api";
import type { Ambulance } from "@/types";

export interface AmbulanceListFilters {
  hospitalId?: string;
  status?: "available" | "busy" | "maintenance";
  page?: number;
  limit?: number;
}

export interface SaveAmbulancePayload {
  hospitalId: string;
  vehicleNumber: string;
  driverName: string;
  contactNumber: string;
  status?: "available" | "busy" | "maintenance";
  currentLocation?: string;
}

export interface AmbulanceListResponse {
  data: Ambulance[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const createQueryString = (filters: AmbulanceListFilters) => {
  const params = new URLSearchParams();

  if (filters.hospitalId) params.set("hospitalId", filters.hospitalId);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : "";
};

const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const ambulanceService = {
  list: async (filters: AmbulanceListFilters = {}) => {
    const response = await apiClient.getEnvelope<Ambulance[]>(
      `/api/ambulances${createQueryString(filters)}`,
    );

    return {
      data: response.data,
      pagination: response.pagination ?? {
        total: response.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? response.data.length,
        totalPages: 1,
      },
    } satisfies AmbulanceListResponse;
  },
  create: (payload: SaveAmbulancePayload, token: string) =>
    apiClient.post<Ambulance, SaveAmbulancePayload>("/api/ambulances", payload, withAuth(token)),
  update: (id: string, payload: Partial<SaveAmbulancePayload>, token: string) =>
    apiClient.patch<Ambulance, Partial<SaveAmbulancePayload>>(`/api/ambulances/${id}`, payload, withAuth(token)),
  remove: (id: string, token: string) =>
    apiClient.delete<{ message?: string }>(`/api/ambulances/${id}`, withAuth(token)),
};

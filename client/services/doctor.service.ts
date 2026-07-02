import { apiClient } from "@/lib/api";
import type { Doctor } from "@/types";

export interface DoctorListFilters {
  hospitalId?: string;
  search?: string;
  specialization?: string;
  department?: string;
  availability?: "true" | "false";
  page?: number;
  limit?: number;
  sortBy?: "name" | "specialization" | "department" | "experience" | "averageRating" | "createdAt";
  order?: "asc" | "desc";
}

export interface DoctorListResponse {
  data: Doctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DoctorPayload {
  hospitalId?: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  availability: boolean;
  averageRating?: number;
}

const withAuth = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

const createQueryString = (filters: DoctorListFilters) => {
  const params = new URLSearchParams();

  if (filters.hospitalId) params.set("hospitalId", filters.hospitalId);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.specialization?.trim()) params.set("specialization", filters.specialization.trim());
  if (filters.department?.trim()) params.set("department", filters.department.trim());
  if (filters.availability) params.set("availability", filters.availability);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.order) params.set("order", filters.order);

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const doctorService = {
  list: async (filters: DoctorListFilters = {}) => {
    const response = await apiClient.getEnvelope<Doctor[]>(
      `/api/doctors${createQueryString(filters)}`,
    );

    return {
      data: response.data,
      pagination: response.pagination ?? {
        total: response.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? response.data.length,
        totalPages: 1,
      },
    } satisfies DoctorListResponse;
  },
  listByHospital: async (hospitalId: string, limit = 6) =>
    doctorService.list({ hospitalId, limit }),
  getById: (id: string) => apiClient.get<Doctor>(`/api/doctors/${id}`),
  create: (payload: DoctorPayload, token: string) =>
    apiClient.post<Doctor, DoctorPayload>("/api/doctors", payload, withAuth(token)),
  update: (id: string, payload: Partial<DoctorPayload>, token: string) =>
    apiClient.patch<Doctor, Partial<DoctorPayload>>(`/api/doctors/${id}`, payload, withAuth(token)),
  remove: (id: string, token: string) =>
    apiClient.delete<{ message?: string }>(`/api/doctors/${id}`, withAuth(token)),
};

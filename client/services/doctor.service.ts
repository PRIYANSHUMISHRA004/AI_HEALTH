import { apiClient } from "@/lib/api";
import type { Doctor } from "@/types";

export interface DoctorListResponse {
  data: Doctor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const doctorService = {
  listByHospital: async (hospitalId: string, limit = 6) => {
    const response = await apiClient.getEnvelope<Doctor[]>(
      `/api/doctors?hospitalId=${encodeURIComponent(hospitalId)}&limit=${limit}`,
    );

    return {
      data: response.data,
      pagination: response.pagination ?? {
        total: response.data.length,
        page: 1,
        limit,
        totalPages: 1,
      },
    } satisfies DoctorListResponse;
  },
};

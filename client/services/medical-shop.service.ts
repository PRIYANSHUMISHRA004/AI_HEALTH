import { apiClient } from "@/lib/api";
import type { MedicalShop } from "@/types";

export interface MedicalShopListFilters {
  city?: string;
  state?: string;
  area?: string;
  page?: number;
  limit?: number;
}

export interface MedicalShopListResponse {
  data: MedicalShop[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const createQueryString = (filters: MedicalShopListFilters) => {
  const params = new URLSearchParams();

  if (filters.city) params.set("city", filters.city);
  if (filters.state) params.set("state", filters.state);
  if (filters.area) params.set("area", filters.area);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const medicalShopService = {
  list: async (filters: MedicalShopListFilters = {}) => {
    const response = await apiClient.getEnvelope<MedicalShop[]>(
      `/api/medical-shops${createQueryString(filters)}`,
    );

    return {
      data: response.data,
      pagination: response.pagination ?? {
        total: response.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? response.data.length,
        totalPages: 1,
      },
    } satisfies MedicalShopListResponse;
  },
};

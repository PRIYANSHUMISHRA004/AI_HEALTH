import { apiClient } from "@/lib/api";
import type { GlobalSearchResponse } from "@/types";

export const searchService = {
  global: async (query: string, limit = 4) =>
    apiClient.get<GlobalSearchResponse>(
      `/api/search/global?query=${encodeURIComponent(query)}&limit=${limit}`,
      { cache: "no-store" },
    ),
};

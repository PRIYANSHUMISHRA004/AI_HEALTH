import { apiClient } from "@/lib/api";
import type { Issue } from "@/types";

export interface IssueListFilters {
  status?: "open" | "in-progress" | "resolved";
  issueType?: "public-help" | "equipment-shortage" | "ambulance-request" | "general";
  roleType?: "patient" | "hospital";
  hospitalId?: string;
  page?: number;
  limit?: number;
}

export interface IssueListResponse {
  data: Issue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  issueType: "public-help" | "equipment-shortage" | "ambulance-request" | "general";
  roleType: "patient" | "hospital";
  hospitalId?: string;
  attachments?: File[];
}

const createQueryString = (filters: IssueListFilters) => {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.issueType) params.set("issueType", filters.issueType);
  if (filters.roleType) params.set("roleType", filters.roleType);
  if (filters.hospitalId) params.set("hospitalId", filters.hospitalId);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const issueService = {
  list: async (filters: IssueListFilters = {}) => {
    const response = await apiClient.getEnvelope<Issue[]>(`/api/issues${createQueryString(filters)}`);

    return {
      data: response.data,
      pagination: response.pagination ?? {
        total: response.data.length,
        page: filters.page ?? 1,
        limit: filters.limit ?? response.data.length,
        totalPages: 1,
      },
    } satisfies IssueListResponse;
  },
  create: async (payload: CreateIssuePayload, token: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_API_URL");
    }

    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    formData.append("issueType", payload.issueType);
    formData.append("roleType", payload.roleType);

    if (payload.hospitalId) {
      formData.append("hospitalId", payload.hospitalId);
    }

    for (const file of payload.attachments ?? []) {
      formData.append("attachments", file);
    }

    const response = await fetch(new URL("/api/issues", baseUrl).toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const payloadJson = (await response.json().catch(() => null)) as
      | { message?: string; data?: Issue }
      | null;

    if (!response.ok) {
      throw new Error(payloadJson?.message || "Failed to create issue");
    }

    if (!payloadJson?.data) {
      throw new Error("Issue created but response payload was missing");
    }

    return payloadJson.data;
  },
};

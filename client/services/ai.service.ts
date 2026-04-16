import { apiClient } from "@/lib/api";
import type { AIInsightsResponse, EmergencyResponse } from "@/types";

interface SummarizeReviewsPayload {
  reviewTexts: string[];
}

interface SummarizeReviewsResponse {
  summary: string;
}

interface ChatPayload {
  message: string;
  context?: string;
}

interface ChatResponse {
  reply: string;
}

interface EmergencyPayload {
  problemDescription: string;
  location: string;
}

export const aiService = {
  summarizeReviews: (reviewTexts: string[]) =>
    apiClient.post<SummarizeReviewsResponse, SummarizeReviewsPayload>("/api/ai/summarize-reviews", {
      reviewTexts,
    }),
  chat: (payload: ChatPayload) =>
    apiClient.post<ChatResponse, ChatPayload>("/api/ai/chat", payload, { cache: "no-store" }),
  emergency: (payload: EmergencyPayload) =>
    apiClient.post<EmergencyResponse, EmergencyPayload>("/api/ai/emergency", payload),
  getInsights: (token: string, hospitalId?: string) =>
    apiClient.get<AIInsightsResponse>(
      hospitalId
        ? `/api/ai/insights?hospitalId=${encodeURIComponent(hospitalId)}`
        : "/api/ai/insights",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      },
    ),
};

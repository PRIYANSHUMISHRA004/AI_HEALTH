export interface ApiSuccessResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiErrorPayload {
  success?: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiRequestOptions<TBody = unknown> extends Omit<RequestInit, "body"> {
  body?: TBody;
}

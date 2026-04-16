export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function createAsyncState<T>(data: T | null = null): AsyncState<T> {
  return {
    data,
    isLoading: false,
    error: null,
  };
}

"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/utils";
import type { AsyncState } from "@/types";

export function useAsyncTask<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const run = async (task: () => Promise<T>) => {
    setState((current) => ({ ...current, isLoading: true, error: null }));

    try {
      const data = await task();
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      setState((current) => ({ ...current, isLoading: false, error: message }));
      throw error;
    }
  };

  const reset = () => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    run,
    reset,
    setData: (data: T | null) => setState((current) => ({ ...current, data })),
    setError: (error: string | null) => setState((current) => ({ ...current, error })),
  };
}

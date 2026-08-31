import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status > 0 && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

import { MutationCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { workspacesQueryKey } from "@/workspaces/useWorkspaces";

function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status > 0 && error.status < 500) {
    return false;
  }

  return failureCount < 2;
}

const mutationCache = new MutationCache({
  onError: (error) => {
    if (error instanceof ApiError && [403, 404].includes(error.status)) {
      void queryClient.invalidateQueries({ queryKey: workspacesQueryKey });
    }
  },
});

export const queryClient = new QueryClient({
  mutationCache,
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

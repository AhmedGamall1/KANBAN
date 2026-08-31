import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, api } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  createdAt: string;
}

export const meQueryKey = ["me"] as const;

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const { user } = await api.get<{ user: AuthUser }>("/auth/me");

    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

export function useAuth() {
  const query = useQuery({
    queryKey: meQueryKey,
    queryFn: fetchMe,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useLogin() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<{ user: AuthUser }>("/auth/login", input),
    onSuccess: ({ user }) => {
      client.setQueryData(meQueryKey, user);
    },
  });
}

export function useSignup() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; password: string; name: string }) =>
      api.post<{ user: AuthUser }>("/auth/signup", input),
    onSuccess: ({ user }) => {
      client.setQueryData(meQueryKey, user);
    },
  });
}

export function useLogout() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.post<void>("/auth/logout"),
    onSuccess: () => {
      client.clear();
    },
  });
}

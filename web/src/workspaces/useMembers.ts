import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { workspacesQueryKey, type Role } from "@/workspaces/useWorkspaces";

export interface Member {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  joinedAt: string;
}

export function membersQueryKey(workspaceId: string) {
  return ["workspaces", workspaceId, "members"] as const;
}

export function useUpdateMemberRole(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { userId: string; role: Role }) =>
      api.patch<{ member: Member }>(
        `/workspaces/${workspaceId}/members/${input.userId}`,
        { role: input.role },
      ),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: membersQueryKey(workspaceId) });
      void client.invalidateQueries({ queryKey: workspacesQueryKey });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api.delete<void>(`/workspaces/${workspaceId}/members/${userId}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: membersQueryKey(workspaceId) });
    },
  });
}

export function useMembers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: membersQueryKey(workspaceId ?? ""),
    queryFn: async () => {
      const { members } = await api.get<{ members: Member[] }>(
        `/workspaces/${workspaceId}/members`,
      );

      return members;
    },
    enabled: Boolean(workspaceId),
  });
}

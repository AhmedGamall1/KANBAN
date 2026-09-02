import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Role } from "@/workspaces/useWorkspaces";

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

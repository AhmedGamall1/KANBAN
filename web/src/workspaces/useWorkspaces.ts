import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Role = "owner" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  createdAt: string;
  role: Role;
}

export const workspacesQueryKey = ["workspaces"] as const;

export function useWorkspaces() {
  return useQuery({
    queryKey: workspacesQueryKey,
    queryFn: async () => {
      const { workspaces } = await api.get<{ workspaces: Workspace[] }>(
        "/workspaces",
      );

      return workspaces;
    },
  });
}

export function useCreateWorkspace() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { workspace } = await api.post<{ workspace: Workspace }>(
        "/workspaces",
        { name },
      );

      return workspace;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: workspacesQueryKey }),
  });
}

export function useWorkspace(workspaceId: string | undefined) {
  const query = useWorkspaces();

  return {
    ...query,
    workspace: query.data?.find((item) => item.id === workspaceId),
  };
}

import { useQuery } from "@tanstack/react-query";
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

export function useWorkspace(workspaceId: string | undefined) {
  const query = useWorkspaces();

  return {
    ...query,
    workspace: query.data?.find((item) => item.id === workspaceId),
  };
}

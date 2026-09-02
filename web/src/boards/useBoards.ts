import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
}

export function boardsQueryKey(workspaceId: string) {
  return ["workspaces", workspaceId, "boards"] as const;
}

export function useCreateBoard(workspaceId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { board } = await api.post<{ board: Board }>(
        `/workspaces/${workspaceId}/boards`,
        { name },
      );

      return board;
    },
    onSuccess: () =>
      client.invalidateQueries({ queryKey: boardsQueryKey(workspaceId) }),
  });
}

export function useBoards(workspaceId: string | undefined) {
  return useQuery({
    queryKey: boardsQueryKey(workspaceId ?? ""),
    queryFn: async () => {
      const { boards } = await api.get<{ boards: Board[] }>(
        `/workspaces/${workspaceId}/boards`,
      );

      return boards;
    },
    enabled: Boolean(workspaceId), // run the query if wsId exists
  });
}

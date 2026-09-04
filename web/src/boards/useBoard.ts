import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { boardsQueryKey, type Board } from "@/boards/useBoards";
import { api } from "@/lib/api";

export type CardLabel = "infra" | "db" | "frontend" | "bug" | "chore";

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: string;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  label: CardLabel | null;
  position: string;
  createdAt: string;
}

interface BoardResponse {
  board: Board;
  columns: Column[];
  cards: Card[];
  seq: string;
}

export interface BoardData {
  board: Board;
  columnsById: Record<string, Column>;
  cardsById: Record<string, Card>;
  columnOrder: string[];
  cardOrder: Record<string, string[]>;
  seq: string;
}

export function boardQueryKey(boardId: string) {
  return ["boards", boardId] as const;
}

function byPosition(a: { position: string }, b: { position: string }): number {
  return Number(a.position) - Number(b.position);
}

export function normalizeBoard(response: BoardResponse): BoardData {
  const columns = [...response.columns].sort(byPosition);
  const columnsById: Record<string, Column> = {};
  const cardOrder: Record<string, string[]> = {};

  for (const column of columns) {
    columnsById[column.id] = column;
    cardOrder[column.id] = [];
  }

  const cardsById: Record<string, Card> = {};

  for (const card of [...response.cards].sort(byPosition)) {
    cardsById[card.id] = card;
    cardOrder[card.columnId]?.push(card.id);
  }

  return {
    board: response.board,
    columnsById,
    cardsById,
    columnOrder: columns.map((column) => column.id),
    cardOrder,
    seq: response.seq,
  };
}

export function patchBoard(
  client: QueryClient,
  boardId: string,
  update: (data: BoardData) => BoardData,
) {
  client.setQueryData<BoardData>(boardQueryKey(boardId), (current) =>
    current ? update(current) : current,
  );
}

export function useRenameBoard(
  boardId: string,
  workspaceId: string | undefined,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (name: string) =>
      api.patch<{ board: Board }>(`/boards/${boardId}`, { name }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: boardQueryKey(boardId) });

      if (workspaceId) {
        void client.invalidateQueries({
          queryKey: boardsQueryKey(workspaceId),
        });
      }
    },
  });
}

export function useDeleteBoard(
  boardId: string,
  workspaceId: string | undefined,
) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete<void>(`/boards/${boardId}`),
    onSuccess: () => {
      client.removeQueries({ queryKey: boardQueryKey(boardId) });

      if (workspaceId) {
        void client.invalidateQueries({
          queryKey: boardsQueryKey(workspaceId),
        });
      }
    },
  });
}

export function useBoard(boardId: string | undefined) {
  return useQuery({
    queryKey: boardQueryKey(boardId ?? ""),
    queryFn: async () =>
      normalizeBoard(await api.get<BoardResponse>(`/boards/${boardId}`)),
    enabled: Boolean(boardId),
  });
}

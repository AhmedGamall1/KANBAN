import { useMutation, useQueryClient } from "@tanstack/react-query";
import { boardQueryKey, patchBoard, type Column } from "@/boards/useBoard";
import { api } from "@/lib/api";

export function useCreateColumn(boardId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { column } = await api.post<{ column: Column }>(
        `/boards/${boardId}/columns`,
        { name },
      );

      return column;
    },
    onSuccess: (column) => {
      patchBoard(client, boardId, (data) => ({
        ...data,
        columnsById: { ...data.columnsById, [column.id]: column },
        columnOrder: [...data.columnOrder, column.id],
        cardOrder: { ...data.cardOrder, [column.id]: [] },
      }));
    },
  });
}

export function useRenameColumn(boardId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: { columnId: string; name: string }) =>
      api.patch<{ column: Column }>(`/columns/${input.columnId}`, {
        name: input.name,
      }),
    onSuccess: ({ column }) => {
      patchBoard(client, boardId, (data) => ({
        ...data,
        columnsById: { ...data.columnsById, [column.id]: column },
      }));
    },
  });
}

export function useMoveColumn(boardId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      columnId: string;
      prevColumnId: string | null;
      nextColumnId: string | null;
    }) =>
      api.patch<{ column: Column }>(`/columns/${input.columnId}`, {
        move: {
          prevColumnId: input.prevColumnId,
          nextColumnId: input.nextColumnId,
        },
      }),
    onSuccess: ({ column }) => {
      patchBoard(client, boardId, (data) => ({
        ...data,
        columnsById: { ...data.columnsById, [column.id]: column },
      }));
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: boardQueryKey(boardId) });
    },
  });
}

export function useDeleteColumn(boardId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) =>
      api.delete<void>(`/columns/${columnId}`),
    onSuccess: (_result, columnId) => {
      patchBoard(client, boardId, (data) => {
        const columnsById = { ...data.columnsById };
        const cardOrder = { ...data.cardOrder };
        const cardsById = { ...data.cardsById };

        for (const cardId of cardOrder[columnId] ?? []) {
          delete cardsById[cardId];
        }

        delete columnsById[columnId];
        delete cardOrder[columnId];

        return {
          ...data,
          columnsById,
          cardsById,
          cardOrder,
          columnOrder: data.columnOrder.filter((id) => id !== columnId),
        };
      });
    },
  });
}

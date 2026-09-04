import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  boardQueryKey,
  patchBoard,
  type BoardData,
  type Card,
} from "@/boards/useBoard";
import { cardActivityQueryKey, type CardChanges } from "@/boards/useCardActivity";
import { api } from "@/lib/api";

export function useCreateCard(boardId: string) {
  const client = useQueryClient();

  return useMutation({
    mutationFn: async (input: { columnId: string; title: string }) => {
      const { card } = await api.post<{ card: Card }>(
        `/boards/${boardId}/cards`,
        input,
      );

      return card;
    },
    onSuccess: (card) => {
      patchBoard(client, boardId, (data) => ({
        ...data,
        cardsById: { ...data.cardsById, [card.id]: card },
        cardOrder: {
          ...data.cardOrder,
          [card.columnId]: [...(data.cardOrder[card.columnId] ?? []), card.id],
        },
      }));
    },
  });
}

// optimistic
export function useUpdateCard(boardId: string) {
  const client = useQueryClient();
  const key = boardQueryKey(boardId);

  return useMutation({
    mutationFn: (input: { cardId: string; changes: CardChanges }) =>
      api.patch<{ card: Card }>(`/cards/${input.cardId}`, input.changes),
    onMutate: async ({ cardId, changes }) => {
      await client.cancelQueries({ queryKey: key });

      const previous = client.getQueryData<BoardData>(key);

      patchBoard(client, boardId, (data) => {
        const card = data.cardsById[cardId];

        if (!card) {
          return data;
        }

        return {
          ...data,
          cardsById: { ...data.cardsById, [cardId]: { ...card, ...changes } },
        };
      });

      return { previous };
    },
    onSuccess: ({ card }) => {
      patchBoard(client, boardId, (data) => ({
        ...data,
        cardsById: { ...data.cardsById, [card.id]: card },
      }));
    },
    onError: (_error, _input, context) => {
      if (context?.previous) {
        client.setQueryData(key, context.previous);
      }
    },
    onSettled: (_data, _error, { cardId }) => {
      void client.invalidateQueries({ queryKey: cardActivityQueryKey(cardId) });
    },
  });
}

// optimistic
export function useDeleteCard(boardId: string) {
  const client = useQueryClient();
  const key = boardQueryKey(boardId);

  return useMutation({
    mutationFn: (cardId: string) => api.delete<void>(`/cards/${cardId}`),
    onMutate: async (cardId) => {
      await client.cancelQueries({ queryKey: key });

      const previous = client.getQueryData<BoardData>(key);

      patchBoard(client, boardId, (data) => {
        const cardsById = { ...data.cardsById };

        delete cardsById[cardId];

        const cardOrder: Record<string, string[]> = {};

        for (const [columnId, ids] of Object.entries(data.cardOrder)) {
          cardOrder[columnId] = ids.filter((id) => id !== cardId);
        }

        return { ...data, cardsById, cardOrder };
      });

      return { previous };
    },
    onError: (_error, _cardId, context) => {
      if (context?.previous) {
        client.setQueryData(key, context.previous);
      }
    },
  });
}

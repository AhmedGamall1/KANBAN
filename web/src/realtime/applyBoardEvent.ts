import type { QueryClient } from "@tanstack/react-query";
import { boardQueryKey, patchBoard, type BoardData } from "@/boards/useBoard";
import { boardsQueryKey } from "@/boards/useBoards";
import { cardActivityQueryKey } from "@/boards/useCardActivity";
import type { BoardEvent } from "@/realtime/socket";

function sortByPosition(
  ids: string[],
  byId: Record<string, { position: string }>,
): string[] {
  return [...ids].sort(
    (a, b) => Number(byId[a]?.position ?? 0) - Number(byId[b]?.position ?? 0),
  );
}

function withoutCard(
  cardOrder: Record<string, string[]>,
  cardId: string,
): Record<string, string[]> {
  const next: Record<string, string[]> = {};

  for (const [columnId, ids] of Object.entries(cardOrder)) {
    next[columnId] = ids.filter((id) => id !== cardId);
  }

  return next;
}

function reduce(data: BoardData, event: BoardEvent): BoardData {
  switch (event.type) {
    case "card_created": {
      const { card } = event.payload;
      const cardsById = { ...data.cardsById, [card.id]: card };
      const cardOrder = withoutCard(data.cardOrder, card.id);

      cardOrder[card.columnId] = sortByPosition(
        [...(cardOrder[card.columnId] ?? []), card.id],
        cardsById,
      );

      return { ...data, cardsById, cardOrder };
    }

    case "card_updated": {
      const card = data.cardsById[event.payload.cardId];

      if (!card) {
        return data;
      }

      return {
        ...data,
        cardsById: {
          ...data.cardsById,
          [card.id]: { ...card, ...event.payload.changes },
        },
      };
    }

    case "card_moved": {
      const { cardId, columnId, position } = event.payload;
      const card = data.cardsById[cardId];

      if (!card) {
        return data;
      }

      const cardsById = {
        ...data.cardsById,
        [cardId]: { ...card, columnId, position },
      };
      const cardOrder = withoutCard(data.cardOrder, cardId);

      cardOrder[columnId] = sortByPosition(
        [...(cardOrder[columnId] ?? []), cardId],
        cardsById,
      );

      return { ...data, cardsById, cardOrder };
    }

    case "card_deleted": {
      const cardsById = { ...data.cardsById };

      delete cardsById[event.payload.cardId];

      return {
        ...data,
        cardsById,
        cardOrder: withoutCard(data.cardOrder, event.payload.cardId),
      };
    }

    case "column_created": {
      const { column } = event.payload;
      const columnsById = { ...data.columnsById, [column.id]: column };

      return {
        ...data,
        columnsById,
        columnOrder: sortByPosition(
          [...data.columnOrder.filter((id) => id !== column.id), column.id],
          columnsById,
        ),
        cardOrder: {
          ...data.cardOrder,
          [column.id]: data.cardOrder[column.id] ?? [],
        },
      };
    }

    case "column_renamed": {
      const column = data.columnsById[event.payload.columnId];

      if (!column) {
        return data;
      }

      return {
        ...data,
        columnsById: {
          ...data.columnsById,
          [column.id]: { ...column, name: event.payload.name },
        },
      };
    }

    case "column_moved": {
      const column = data.columnsById[event.payload.columnId];

      if (!column) {
        return data;
      }

      const columnsById = {
        ...data.columnsById,
        [column.id]: { ...column, position: event.payload.position },
      };

      return {
        ...data,
        columnsById,
        columnOrder: sortByPosition(data.columnOrder, columnsById),
      };
    }

    case "column_deleted": {
      const { columnId } = event.payload;
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
    }

    case "board_renamed":
      return {
        ...data,
        board: { ...data.board, name: event.payload.name },
      };

    case "board_created":
      return data;
  }
}

export function applyBoardEvent(client: QueryClient, event: BoardEvent) {
  patchBoard(client, event.boardId, (data) => {
    if (Number(event.seq) <= Number(data.seq)) {
      return data;
    }

    return { ...reduce(data, event), seq: event.seq };
  });

  if ("cardId" in event.payload) {
    void client.invalidateQueries({
      queryKey: cardActivityQueryKey(event.payload.cardId),
    });
  }

  if (event.type === "board_renamed") {
    const board = client.getQueryData<BoardData>(boardQueryKey(event.boardId));

    if (board) {
      void client.invalidateQueries({
        queryKey: boardsQueryKey(board.board.workspaceId),
      });
    }
  }
}

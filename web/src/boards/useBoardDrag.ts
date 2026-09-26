import { move } from "@dnd-kit/helpers";
import { useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { boardQueryKey, type BoardData } from "@/boards/useBoard";
import { useMoveCard } from "@/boards/useCards";
import { useMoveColumn } from "@/boards/useColumns";

type ReorderEvent = Parameters<typeof move>[1];

interface DragSource {
  type?: unknown;
  id: unknown;
}

export function useBoardDrag(boardId: string) {
  const queryClient = useQueryClient();
  const moveColumn = useMoveColumn(boardId);
  const moveCard = useMoveCard(boardId);
  const snapshot = useRef<BoardData | null>(null);

  function currentBoard() {
    return queryClient.getQueryData<BoardData>(boardQueryKey(boardId));
  }

  function columnOf(board: BoardData, cardId: string) {
    return board.columnOrder.find((id) => board.cardOrder[id]?.includes(cardId));
  }

  function capture() {
    snapshot.current = currentBoard() ?? null;
  }

  function rollback() {
    if (snapshot.current) {
      queryClient.setQueryData(boardQueryKey(boardId), snapshot.current);
    }
  }

  function reorder(event: ReorderEvent, kind: string) {
    queryClient.setQueryData<BoardData>(boardQueryKey(boardId), (previous) => {
      if (!previous) {
        return previous;
      }

      return kind === "column"
        ? { ...previous, columnOrder: move(previous.columnOrder, event) }
        : { ...previous, cardOrder: move(previous.cardOrder, event) };
    });
  }

  function persistColumnMove(columnId: string) {
    const order = currentBoard()?.columnOrder ?? [];
    const index = order.indexOf(columnId);

    if (index === -1 || snapshot.current?.columnOrder[index] === columnId) {
      return;
    }

    moveColumn.mutate(
      {
        columnId,
        prevColumnId: order[index - 1] ?? null,
        nextColumnId: order[index + 1] ?? null,
      },
      { onError: rollback },
    );
  }

  function persistCardMove(cardId: string) {
    const board = currentBoard();
    const columnId = board ? columnOf(board, cardId) : undefined;

    if (!board || !columnId) {
      return;
    }

    const siblings = board.cardOrder[columnId];
    const index = siblings.indexOf(cardId);
    const before = snapshot.current;

    if (
      before &&
      columnOf(before, cardId) === columnId &&
      before.cardOrder[columnId]?.[index] === cardId
    ) {
      return;
    }

    moveCard.mutate(
      {
        cardId,
        columnId,
        prevCardId: siblings[index - 1] ?? null,
        nextCardId: siblings[index + 1] ?? null,
      },
      { onError: rollback },
    );
  }

  function persist(source: DragSource | null | undefined) {
    if (source?.type === "column") {
      persistColumnMove(String(source.id));
    } else if (source?.type === "card") {
      persistCardMove(String(source.id));
    }
  }

  return { capture, reorder, rollback, persist };
}

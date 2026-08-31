import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useState } from "react";
import { useParams } from "react-router";
import BoardColumn from "@/components/board/BoardColumn";
import CardDrawer from "@/components/board/CardDrawer";
import PresenceBar from "@/components/board/PresenceBar";
import { PlusIcon } from "@/components/ui/icons";
import {
  boards,
  cards,
  columns,
  editingCards,
  members,
  presence,
  workspaces,
  type Board,
  type Card,
  type Column,
  type Member,
} from "@/data/fixtures";

function byPosition(a: { position: string }, b: { position: string }): number {
  return Number(a.position) - Number(b.position);
}

function BoardView({ board }: { board: Board }) {
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns
      .filter((column) => column.boardId === board.id)
      .sort(byPosition)
      .map((column) => column.id),
  );

  const [cardOrder, setCardOrder] = useState<Record<string, string[]>>(() => {
    const order: Record<string, string[]> = {};

    for (const column of columns.filter((item) => item.boardId === board.id)) {
      order[column.id] = cards
        .filter((card) => card.columnId === column.id)
        .sort(byPosition)
        .map((card) => card.id);
    }

    return order;
  });

  const columnsById: Record<string, Column> = {};

  for (const column of columns) {
    columnsById[column.id] = column;
  }

  const cardsById: Record<string, Card> = {};

  for (const card of cards) {
    cardsById[card.id] = card;
  }

  const boardMembers = members.filter(
    (member) => member.workspaceId === board.workspaceId,
  );
  const membersById: Record<string, Member> = {};

  for (const member of boardMembers) {
    membersById[member.userId] = member;
  }

  const workspace = workspaces.find((item) => item.id === board.workspaceId);
  const canEdit = workspace?.role !== "viewer";
  const boardColumns = columnOrder.map((columnId) => columnsById[columnId]);
  const openCard = openCardId ? cardsById[openCardId] : undefined;
  const openCardColumnId = openCardId
    ? columnOrder.find((columnId) => cardOrder[columnId]?.includes(openCardId))
    : undefined;

  return (
    <DragDropProvider
      onDragOver={(event) => {
        if (event.operation.source?.type === "column") {
          setColumnOrder((order) => move(order, event));
          return;
        }

        setCardOrder((order) => move(order, event));
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-6 py-3">
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink">
            {board.name}
          </h1>

          <PresenceBar
            users={presence.filter((user) => user.boardId === board.id)}
          />
        </header>

        {boardColumns.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-8">
            <div className="rounded-card border border-dashed border-line-strong px-6 py-12 text-center">
              <p className="font-medium text-ink">No columns yet</p>
              <p className="mt-1 text-ink-muted">
                {canEdit
                  ? "Add a column to start moving work across this board."
                  : "Nobody has added a column to this board yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-6">
            <div className="flex h-full items-start gap-3">
              {boardColumns.map((column, columnIndex) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  index={columnIndex}
                  cards={(cardOrder[column.id] ?? []).map(
                    (cardId) => cardsById[cardId],
                  )}
                  membersById={membersById}
                  canEdit={canEdit}
                  editingCards={editingCards}
                  onOpenCard={setOpenCardId}
                />
              ))}

              {canEdit && (
                <button
                  type="button"
                  className="flex w-72 shrink-0 items-center gap-1.5 rounded-card border border-dashed border-line-strong px-3 py-2.5 text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
                >
                  <PlusIcon />
                  Add a column
                </button>
              )}
            </div>
          </div>
        )}

        {openCard && (
          <CardDrawer
            key={openCard.id}
            card={openCard}
            column={
              openCardColumnId ? columnsById[openCardColumnId] : undefined
            }
            columnsById={columnsById}
            membersById={membersById}
            boardMembers={boardMembers}
            canEdit={canEdit}
            onClose={() => setOpenCardId(null)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}

export default function BoardPage() {
  const { boardId } = useParams();
  const board = boards.find((item) => item.id === boardId);

  if (!board) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">Board not found</p>
        <p className="mt-1 text-ink-muted">
          It may have been deleted, or you no longer have access to it.
        </p>
      </div>
    );
  }

  return <BoardView key={board.id} board={board} />;
}

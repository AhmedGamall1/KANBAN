import { useState } from "react";
import { useParams } from "react-router";
import BoardColumn from "@/components/board/BoardColumn";
import CardDrawer from "@/components/board/CardDrawer";
import { PlusIcon } from "@/components/ui/icons";
import {
  boards,
  cards,
  columns,
  members,
  workspaces,
  type Column,
  type Member,
} from "@/data/fixtures";

export default function BoardPage() {
  const { boardId } = useParams();
  const [openCardId, setOpenCardId] = useState<string | null>(null);
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

  const workspace = workspaces.find((item) => item.id === board.workspaceId);
  const canEdit = workspace?.role !== "viewer";
  const boardColumns = columns.filter((column) => column.boardId === board.id);
  const boardMembers = members.filter(
    (member) => member.workspaceId === board.workspaceId,
  );
  const membersById: Record<string, Member> = {};

  for (const member of boardMembers) {
    membersById[member.userId] = member;
  }

  const columnsById: Record<string, Column> = {};

  for (const column of boardColumns) {
    columnsById[column.id] = column;
  }

  const openCard = cards.find((card) => card.id === openCardId);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-6 py-3">
        <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight text-ink">
          {board.name}
        </h1>
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
            {boardColumns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                cards={cards.filter((card) => card.columnId === column.id)}
                membersById={membersById}
                canEdit={canEdit}
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
          column={columnsById[openCard.columnId]}
          columnsById={columnsById}
          membersById={membersById}
          boardMembers={boardMembers}
          canEdit={canEdit}
          onClose={() => setOpenCardId(null)}
        />
      )}
    </div>
  );
}

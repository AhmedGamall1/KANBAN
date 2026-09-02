import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router";
import { boardQueryKey, useBoard, type BoardData } from "@/boards/useBoard";
import BoardColumn from "@/components/board/BoardColumn";
import CardDrawer from "@/components/board/CardDrawer";
import PresenceBar from "@/components/board/PresenceBar";
import Spinner from "@/components/ui/Spinner";
import { PlusIcon } from "@/components/ui/icons";
import { editingCards, presence } from "@/data/fixtures";
import { useMembers, type Member } from "@/workspaces/useMembers";
import { useWorkspace } from "@/workspaces/useWorkspaces";

export default function BoardPage() {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const { data, isPending, error } = useBoard(boardId);
  const { workspace } = useWorkspace(data?.board.workspaceId);
  const { data: boardMembers } = useMembers(data?.board.workspaceId);

  if (isPending) {
    return <Spinner />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">Board not found</p>
        <p className="mt-1 text-ink-muted">
          {error?.message ??
            "It may have been deleted, or you no longer have access to it."}
        </p>
      </div>
    );
  }

  const canEdit = workspace ? workspace.role !== "viewer" : false;

  const boardColumns = data.columnOrder.map((id) => data.columnsById[id]);

  const openCard = openCardId ? data.cardsById[openCardId] : undefined;

  const openCardColumnId = openCardId
    ? data.columnOrder.find((id) => data.cardOrder[id]?.includes(openCardId))
    : undefined;

  const membersById: Record<string, Member> = {};

  for (const member of boardMembers ?? []) {
    membersById[member.userId] = member;
  }

  function reorder(event: Parameters<typeof move>[1], kind: string) {
    queryClient.setQueryData<BoardData>(
      boardQueryKey(boardId ?? ""),
      (previous) => {
        if (!previous) {
          return previous;
        }

        return kind === "column"
          ? { ...previous, columnOrder: move(previous.columnOrder, event) }
          : { ...previous, cardOrder: move(previous.cardOrder, event) };
      },
    );
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        reorder(event, String(event.operation.source?.type ?? "card"));
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-6 py-3">
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink">
            {data.board.name}
          </h1>

          <PresenceBar
            users={presence.filter((user) => user.boardId === data.board.id)}
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
                  cards={(data.cardOrder[column.id] ?? []).map(
                    (cardId) => data.cardsById[cardId],
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
              openCardColumnId ? data.columnsById[openCardColumnId] : undefined
            }
            columnsById={data.columnsById}
            membersById={membersById}
            boardMembers={boardMembers ?? []}
            canEdit={canEdit}
            onClose={() => setOpenCardId(null)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}

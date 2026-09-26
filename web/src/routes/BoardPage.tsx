import { DragDropProvider } from "@dnd-kit/react";
import { useRef, useState } from "react";
import { useParams } from "react-router";
import { useBoard } from "@/boards/useBoard";
import { useBoardDrag } from "@/boards/useBoardDrag";
import { useCreateCard } from "@/boards/useCards";
import BoardColumn from "@/components/board/BoardColumn";
import BoardDialogs, {
  type BoardDialog,
} from "@/components/board/BoardDialogs";
import CardDrawer from "@/components/board/CardDrawer";
import ConnectionStatus from "@/components/board/ConnectionStatus";
import CursorLayer from "@/components/board/CursorLayer";
import PresenceBar from "@/components/board/PresenceBar";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useBoardSocket } from "@/realtime/useBoardSocket";
import { useCursorBroadcast } from "@/realtime/useCursorBroadcast";
import { useMembers, type Member } from "@/workspaces/useMembers";
import { useWorkspace } from "@/workspaces/useWorkspaces";

export default function BoardPage() {
  const { boardId } = useParams();

  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<BoardDialog | null>(null);

  const { data, isPending, error } = useBoard(boardId);
  const { workspace } = useWorkspace(data?.board.workspaceId);
  const { data: boardMembers } = useMembers(data?.board.workspaceId);
  const createCard = useCreateCard(boardId ?? "");

  const { status, role, presence, cursors, editingCards } =
    useBoardSocket(boardId);
  const drag = useBoardDrag(boardId ?? "");
  const surface = useRef<HTMLDivElement>(null);
  const trackCursor = useCursorBroadcast(surface);

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

  const knownRoles = [role, workspace?.role].filter(Boolean);
  const canEdit =
    knownRoles.length > 0 && knownRoles.every((known) => known !== "viewer");

  const boardColumns = data.columnOrder.map((id) => data.columnsById[id]);

  const openCard = openCardId ? data.cardsById[openCardId] : undefined;

  const openCardColumnId = openCardId
    ? data.columnOrder.find((id) => data.cardOrder[id]?.includes(openCardId))
    : undefined;

  const membersById: Record<string, Member> = {};

  for (const member of boardMembers ?? []) {
    membersById[member.userId] = member;
  }

  return (
    <DragDropProvider
      onDragStart={drag.capture}
      onDragOver={(event) => {
        drag.reorder(event, String(event.operation.source?.type ?? "card"));
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          drag.rollback();
          return;
        }

        drag.persist(event.operation.source);
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-center gap-4 border-b border-line bg-surface px-6 py-3">
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight text-ink">
            {data.board.name}
          </h1>

          <ConnectionStatus status={status} />

          <PresenceBar users={presence} />

          {canEdit && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Rename board"
                title="Rename board"
                onClick={() => setDialog("rename")}
                className="rounded-control p-1.5 text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
              >
                <PencilIcon />
              </button>

              <button
                type="button"
                aria-label="Delete board"
                title="Delete board"
                onClick={() => setDialog("delete")}
                className="rounded-control p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon />
              </button>
            </div>
          )}
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

              {canEdit && (
                <Button className="mt-4" onClick={() => setDialog("column")}>
                  Add a column
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-x-auto p-6" onPointerMove={trackCursor}>
            <div className="flex h-full items-start gap-3">
              <div
                ref={surface}
                className="relative flex h-full w-max items-start gap-3"
              >
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
                    addingCard={
                      createCard.isPending &&
                      createCard.variables?.columnId === column.id
                    }
                    addError={
                      createCard.error instanceof ApiError &&
                      createCard.variables?.columnId === column.id
                        ? (createCard.error.fieldError("title") ??
                          createCard.error.message)
                        : undefined
                    }
                    onAddCard={(columnId, title) =>
                      createCard.mutateAsync({ columnId, title })
                    }
                    onOpenCard={setOpenCardId}
                  />
                ))}

                <CursorLayer cursors={cursors} presence={presence} />
              </div>

              {canEdit && (
                <button
                  type="button"
                  onClick={() => setDialog("column")}
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

        {dialog && (
          <BoardDialogs
            board={data.board}
            open={dialog}
            onClose={() => setDialog(null)}
          />
        )}
      </div>
    </DragDropProvider>
  );
}

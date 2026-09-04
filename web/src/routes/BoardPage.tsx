import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  boardQueryKey,
  useBoard,
  useDeleteBoard,
  useRenameBoard,
  type BoardData,
} from "@/boards/useBoard";
import { useCreateCard } from "@/boards/useCards";
import { useCreateColumn, useMoveColumn } from "@/boards/useColumns";
import BoardColumn from "@/components/board/BoardColumn";
import CardDrawer from "@/components/board/CardDrawer";
import PresenceBar from "@/components/board/PresenceBar";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import NameDialog from "@/components/ui/NameDialog";
import Spinner from "@/components/ui/Spinner";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { editingCards, presence } from "@/data/fixtures";
import { ApiError } from "@/lib/api";
import { useMembers, type Member } from "@/workspaces/useMembers";
import { useWorkspace } from "@/workspaces/useWorkspaces";

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);

  const { data, isPending, error } = useBoard(boardId);
  const { workspace } = useWorkspace(data?.board.workspaceId);
  const { data: boardMembers } = useMembers(data?.board.workspaceId);
  const renameBoard = useRenameBoard(boardId ?? "", data?.board.workspaceId);
  const deleteBoard = useDeleteBoard(boardId ?? "", data?.board.workspaceId);
  const createCard = useCreateCard(boardId ?? "");
  const createColumn = useCreateColumn(boardId ?? "");
  const moveColumn = useMoveColumn(boardId ?? "");

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

  function persistColumnMove(columnId: string) {
    const order =
      queryClient.getQueryData<BoardData>(boardQueryKey(boardId ?? ""))
        ?.columnOrder ?? [];
    const index = order.indexOf(columnId);

    if (index === -1) {
      return;
    }

    moveColumn.mutate({
      columnId,
      prevColumnId: order[index - 1] ?? null,
      nextColumnId: order[index + 1] ?? null,
    });
  }

  return (
    <DragDropProvider
      onDragOver={(event) => {
        reorder(event, String(event.operation.source?.type ?? "card"));
      }}
      onDragEnd={(event) => {
        const source = event.operation.source;

        if (!event.canceled && source?.type === "column") {
          persistColumnMove(String(source.id));
        }
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

          {canEdit && (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Rename board"
                title="Rename board"
                onClick={() => {
                  renameBoard.reset();
                  setRenaming(true);
                }}
                className="rounded-control p-1.5 text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
              >
                <PencilIcon />
              </button>

              <button
                type="button"
                aria-label="Delete board"
                title="Delete board"
                onClick={() => {
                  deleteBoard.reset();
                  setDeleting(true);
                }}
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
                <Button
                  className="mt-4"
                  onClick={() => {
                    createColumn.reset();
                    setAddingColumn(true);
                  }}
                >
                  Add a column
                </Button>
              )}
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

              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    createColumn.reset();
                    setAddingColumn(true);
                  }}
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

        {addingColumn && (
          <NameDialog
            title="Add column"
            label="Column name"
            submitLabel="Add column"
            placeholder="In review"
            pending={createColumn.isPending}
            error={
              createColumn.error instanceof ApiError
                ? (createColumn.error.fieldError("name") ??
                  createColumn.error.message)
                : undefined
            }
            onClose={() => setAddingColumn(false)}
            onSubmit={(name) =>
              createColumn.mutate(name, {
                onSuccess: () => setAddingColumn(false),
              })
            }
          />
        )}

        {renaming && (
          <NameDialog
            title="Rename board"
            label="Board name"
            submitLabel="Save"
            initialValue={data.board.name}
            pending={renameBoard.isPending}
            error={
              renameBoard.error instanceof ApiError
                ? (renameBoard.error.fieldError("name") ??
                  renameBoard.error.message)
                : undefined
            }
            onClose={() => setRenaming(false)}
            onSubmit={(name) =>
              renameBoard.mutate(name, {
                onSuccess: () => setRenaming(false),
              })
            }
          />
        )}

        {deleting && (
          <ConfirmDialog
            title="Delete board"
            body={`"${data.board.name}" and every column and card on it will be deleted. This cannot be undone.`}
            confirmLabel="Delete board"
            pending={deleteBoard.isPending}
            error={
              deleteBoard.error instanceof ApiError
                ? deleteBoard.error.message
                : undefined
            }
            onClose={() => setDeleting(false)}
            onConfirm={() =>
              deleteBoard.mutate(undefined, {
                onSuccess: () => {
                  setDeleting(false);
                  navigate(`/workspaces/${data.board.workspaceId}`, {
                    replace: true,
                  });
                },
              })
            }
          />
        )}
      </div>
    </DragDropProvider>
  );
}

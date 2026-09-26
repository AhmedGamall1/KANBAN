import { useNavigate } from "react-router";
import { useDeleteBoard, useRenameBoard } from "@/boards/useBoard";
import type { Board } from "@/boards/useBoards";
import { useCreateColumn } from "@/boards/useColumns";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import NameDialog from "@/components/ui/NameDialog";
import { ApiError } from "@/lib/api";

export type BoardDialog = "column" | "rename" | "delete";

interface BoardDialogsProps {
  board: Board;
  open: BoardDialog;
  onClose: () => void;
}

function messageFor(error: unknown, field?: string): string | undefined {
  if (!(error instanceof ApiError)) {
    return undefined;
  }

  return field ? (error.fieldError(field) ?? error.message) : error.message;
}

export default function BoardDialogs({
  board,
  open,
  onClose,
}: BoardDialogsProps) {
  const navigate = useNavigate();
  const createColumn = useCreateColumn(board.id);
  const renameBoard = useRenameBoard(board.id, board.workspaceId);
  const deleteBoard = useDeleteBoard(board.id, board.workspaceId);

  if (open === "column") {
    return (
      <NameDialog
        title="Add column"
        label="Column name"
        submitLabel="Add column"
        placeholder="In review"
        pending={createColumn.isPending}
        error={messageFor(createColumn.error, "name")}
        onClose={onClose}
        onSubmit={(name) => createColumn.mutate(name, { onSuccess: onClose })}
      />
    );
  }

  if (open === "rename") {
    return (
      <NameDialog
        title="Rename board"
        label="Board name"
        submitLabel="Save"
        initialValue={board.name}
        pending={renameBoard.isPending}
        error={messageFor(renameBoard.error, "name")}
        onClose={onClose}
        onSubmit={(name) => renameBoard.mutate(name, { onSuccess: onClose })}
      />
    );
  }

  return (
    <ConfirmDialog
      title="Delete board"
      body={`"${board.name}" and every column and card on it will be deleted. This cannot be undone.`}
      confirmLabel="Delete board"
      pending={deleteBoard.isPending}
      error={messageFor(deleteBoard.error)}
      onClose={onClose}
      onConfirm={() =>
        deleteBoard.mutate(undefined, {
          onSuccess: () => {
            onClose();
            navigate(`/workspaces/${board.workspaceId}`, { replace: true });
          },
        })
      }
    />
  );
}

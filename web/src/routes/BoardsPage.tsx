import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useBoards, useCreateBoard } from "@/boards/useBoards";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import NameDialog from "@/components/ui/NameDialog";
import Spinner from "@/components/ui/Spinner";
import { BoardIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useWorkspace } from "@/workspaces/useWorkspaces";

export default function BoardsPage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const createBoard = useCreateBoard(workspaceId ?? "");
  const { workspace, isPending: workspacePending } = useWorkspace(workspaceId);
  const {
    data: boards,
    isPending: boardsPending,
    error,
  } = useBoards(workspaceId);

  if (workspacePending || boardsPending) {
    return <Spinner />;
  }

  if (!workspace) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">Workspace not found</p>
        <p className="mt-1 text-ink-muted">
          It may have been deleted, or you are no longer a member of it.
        </p>
      </div>
    );
  }

  const canEdit = workspace.role !== "viewer";

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader
        title="Boards"
        description={`Every board in ${workspace.name}.`}
        action={
          canEdit ? (
            <Button
              onClick={() => {
                createBoard.reset();
                setCreating(true);
              }}
            >
              New board
            </Button>
          ) : undefined
        }
      />

      {error ? (
        <div className="mt-6 rounded-card border border-line bg-surface px-6 py-12 text-center">
          <p className="font-medium text-ink">Could not load boards</p>
          <p className="mt-1 text-ink-muted">{error.message}</p>
        </div>
      ) : boards.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line-strong px-6 py-12 text-center">
          <p className="font-medium text-ink">No boards yet</p>
          <p className="mt-1 text-ink-muted">
            {canEdit
              ? "Create the first board to get this workspace moving."
              : "Nobody has created a board in this workspace yet."}
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                className="flex items-center gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-subtle"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                  <BoardIcon />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-ink">
                  {board.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {creating && (
        <NameDialog
          title="Create board"
          label="Board name"
          submitLabel="Create board"
          placeholder="Q3 roadmap"
          pending={createBoard.isPending}
          error={
            createBoard.error instanceof ApiError
              ? (createBoard.error.fieldError("name") ??
                createBoard.error.message)
              : undefined
          }
          onClose={() => setCreating(false)}
          onSubmit={(name) =>
            createBoard.mutate(name, {
              onSuccess: (board) => {
                setCreating(false);
                navigate(`/boards/${board.id}`);
              },
            })
          }
        />
      )}
    </div>
  );
}

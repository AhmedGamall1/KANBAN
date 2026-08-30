import { Link, useParams } from "react-router";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/ui/Button";
import { boards, workspaces } from "@/data/fixtures";

function BoardIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="3.5" height="10" rx="1" />
      <rect x="6.25" y="3" width="3.5" height="7" rx="1" />
      <rect x="10.5" y="3" width="3.5" height="4.5" rx="1" />
    </svg>
  );
}

export default function BoardsPage() {
  const { workspaceId } = useParams();
  const workspace =
    workspaces.find((item) => item.id === workspaceId) ?? workspaces[0];
  const workspaceBoards = boards.filter(
    (board) => board.workspaceId === workspace.id,
  );
  const canEdit = workspace.role !== "viewer";

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <PageHeader
        title="Boards"
        description={`Every board in ${workspace.name}.`}
        action={canEdit ? <Button>New board</Button> : undefined}
      />

      {workspaceBoards.length === 0 ? (
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
          {workspaceBoards.map((board) => (
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
    </div>
  );
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import Button from "@/components/ui/Button";
import NameDialog from "@/components/ui/NameDialog";
import Spinner from "@/components/ui/Spinner";
import { BoardIcon } from "@/components/ui/icons";
import { ApiError } from "@/lib/api";
import { useCreateWorkspace, useWorkspaces } from "@/workspaces/useWorkspaces";

export default function WorkspacesIndexPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const createWorkspace = useCreateWorkspace();
  const { data: workspaces, isPending, error } = useWorkspaces();

  if (isPending) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">Could not load your workspaces</p>
        <p className="mt-1 text-ink-muted">{error.message}</p>
      </div>
    );
  }

  if (workspaces.length > 0) {
    return <Navigate to={`/workspaces/${workspaces[0].id}`} replace />;
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-8 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-card bg-brand-soft text-brand">
        <BoardIcon className="h-6 w-6 shrink-0" />
      </span>

      <h1 className="mt-5 text-xl font-semibold tracking-tight text-ink">
        Create your first workspace
      </h1>

      <p className="mt-2 text-ink-muted">
        A workspace holds your boards and the people you share them with. Most
        teams start with one and add more later.
      </p>

      <Button
        size="lg"
        className="mt-6"
        onClick={() => {
          createWorkspace.reset();
          setCreating(true);
        }}
      >
        Create workspace
      </Button>

      <p className="mt-8 text-sm text-ink-faint">
        Joining a team instead? Open the invite link they sent you.
      </p>

      {creating && (
        <NameDialog
          title="Create workspace"
          label="Workspace name"
          submitLabel="Create workspace"
          placeholder="Acme product"
          pending={createWorkspace.isPending}
          error={
            createWorkspace.error instanceof ApiError
              ? (createWorkspace.error.fieldError("name") ??
                createWorkspace.error.message)
              : undefined
          }
          onClose={() => setCreating(false)}
          onSubmit={(name) =>
            createWorkspace.mutate(name, {
              onSuccess: (workspace) => {
                setCreating(false);
                navigate(`/workspaces/${workspace.id}`, { replace: true });
              },
            })
          }
        />
      )}
    </div>
  );
}

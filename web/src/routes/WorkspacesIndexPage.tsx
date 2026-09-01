import { Navigate } from "react-router";
import Spinner from "@/components/ui/Spinner";
import { useWorkspaces } from "@/workspaces/useWorkspaces";

export default function WorkspacesIndexPage() {
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

  if (workspaces.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">No workspaces yet</p>
        <p className="mt-1 text-ink-muted">
          Create one to start adding boards, or accept an invite link from a
          teammate.
        </p>
      </div>
    );
  }

  return <Navigate to={`/workspaces/${workspaces[0].id}`} replace />;
}

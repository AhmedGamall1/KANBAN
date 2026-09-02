import { Link, useNavigate, useParams } from "react-router";
import Button from "@/components/ui/Button";
import AuthLayout from "@/layouts/AuthLayout";
import { ApiError } from "@/lib/api";
import { useAcceptInvite } from "@/workspaces/useInvite";

export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const accept = useAcceptInvite();

  const error = accept.error instanceof ApiError ? accept.error : null;
  const isBadLink = error?.status === 404 || error?.status === 400;

  return (
    <AuthLayout
      title="Join workspace"
      subtitle="This invite adds you as a member, with access to every board in the workspace."
      footer={
        <Link
          to="/workspaces"
          className="font-medium text-brand hover:underline"
        >
          Go to your workspaces
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <p className="rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
            {isBadLink
              ? "This invite link is not valid. Ask whoever sent it for a new one."
              : error.message}
          </p>
        )}

        <Button
          size="lg"
          fullWidth
          disabled={accept.isPending || isBadLink}
          onClick={() =>
            accept.mutate(token ?? "", {
              onSuccess: ({ workspace }) =>
                navigate(`/workspaces/${workspace.id}`, { replace: true }),
            })
          }
        >
          {accept.isPending ? "Joining…" : "Accept invite"}
        </Button>
      </div>
    </AuthLayout>
  );
}

import { useQueryClient } from "@tanstack/react-query";
import { meQueryKey, useGuestLogin } from "@/auth/useAuth";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { ApiError } from "@/lib/api";

interface DemoEntryProps {
  onStarted: (boardId: string) => void;
}

export default function DemoEntry({ onStarted }: DemoEntryProps) {
  const client = useQueryClient();
  const guest = useGuestLogin();

  const error = guest.error
    ? guest.error instanceof ApiError
      ? guest.error.status === 429
        ? "The demo has been busy. Please try again in a few minutes or use the actual project."
        : guest.error.message
      : "Could not start the demo. Please try again."
    : null;

  function start() {
    guest.mutate(undefined, {
      onSuccess: ({ user, boardId }) => {
        client.setQueryData(meQueryKey, user);
        onStarted(boardId);
      },
    });
  }

  return (
    <div className="mb-6 rounded-card border border-line bg-subtle p-4">
      <p className="font-medium text-ink">Just looking?</p>
      <p className="mt-1 text-sm text-ink-muted">
        Open a demo board with real data, a team and an activity history. No
        sign up, nothing to clean up.
      </p>

      {error && (
        <p className="mt-3 rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={start}
        disabled={guest.isPending}
        className={buttonClasses({
          size: "lg",
          fullWidth: true,
          className: "mt-3",
        })}
      >
        {guest.isPending ? "Preparing your board…" : "Try the demo"}
      </button>
    </div>
  );
}

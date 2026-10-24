import { useState } from "react";
import { Link } from "react-router";
import { CloseIcon } from "@/components/ui/icons";

const STORAGE_KEY = "board-tips";

function readDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

function remember() {
  try {
    localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    return;
  }
}

interface BoardTipsProps {
  workspaceId: string;
  canEdit: boolean;
  canInvite: boolean;
}

export default function BoardTips({
  workspaceId,
  canEdit,
  canInvite,
}: BoardTipsProps) {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || (!canEdit && !canInvite)) {
    return null;
  }

  function dismiss() {
    remember();
    setDismissed(true);
  }

  return (
    <div className="flex shrink-0 items-start gap-3 border-b border-line bg-subtle px-6 py-2.5 text-sm text-ink-muted">
      <p className="min-w-0 flex-1">
        <span className="font-medium text-ink">Tip:</span>{" "}
        {canEdit && "Drag cards and columns to move them. "}
        {canInvite && (
          <>
            To see live collaboration, copy the invite link from{" "}
            <Link
              to={`/workspaces/${workspaceId}/members`}
              className="font-medium text-brand hover:underline"
            >
              Members
            </Link>
            , open it in a private window, choose{" "}
            <span className="font-medium text-ink">Try the demo</span>, then
            accept.
          </>
        )}
      </p>

      <button
        type="button"
        aria-label="Dismiss tip"
        title="Dismiss tip"
        onClick={dismiss}
        className="rounded-control p-1 text-ink-faint transition-colors hover:bg-line hover:text-ink"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

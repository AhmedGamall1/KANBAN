import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

const STORAGE_KEY = "small-screen-notice";
const SMALL_SCREEN = "(max-width: 1023px)";

function shouldShow(): boolean {
  if (!window.matchMedia(SMALL_SCREEN).matches) {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) !== "dismissed";
  } catch {
    return true;
  }
}

function remember() {
  try {
    localStorage.setItem(STORAGE_KEY, "dismissed");
  } catch {
    return;
  }
}

export default function SmallScreenNotice() {
  const [open, setOpen] = useState(shouldShow);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  function dismiss() {
    remember();
    setOpen(false);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={dismiss}
      className="m-auto w-full max-w-sm rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-scrim"
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Best on a laptop
        </h2>
        <p className="mt-2 text-ink-muted">
          Collab Board is built for larger screens. Dragging cards and live
          cursors work best on a laptop or desktop.
        </p>

        <div className="mt-5 flex justify-end">
          <Button onClick={dismiss}>Continue anyway</Button>
        </div>
      </div>
    </dialog>
  );
}

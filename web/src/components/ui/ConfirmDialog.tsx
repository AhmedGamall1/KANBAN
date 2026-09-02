import { useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  pending?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  pending = false,
  error,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="m-auto w-full max-w-sm rounded-card border border-line bg-surface p-0 text-ink backdrop:bg-ink/20"
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p className="mt-2 text-ink-muted">{body}</p>

        {error && (
          <p className="mt-3 rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

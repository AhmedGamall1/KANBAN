import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

interface NameDialogProps {
  title: string;
  label: string;
  submitLabel: string;
  placeholder?: string;
  initialValue?: string;
  error?: string;
  pending?: boolean;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export default function NameDialog({
  title,
  label,
  submitLabel,
  placeholder,
  initialValue = "",
  error,
  pending = false,
  onSubmit,
  onClose,
}: NameDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(initialValue);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = name.trim();

    if (trimmed.length > 0) {
      onSubmit(trimmed);
    }
  }

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
      <form className="p-5" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          {title}
        </h2>

        <div className="mt-4">
          <TextField
            label={label}
            name="name"
            value={name}
            placeholder={placeholder}
            error={error}
            autoFocus
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={pending || name.trim().length === 0}
          >
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

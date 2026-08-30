import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Avatar from "@/components/ui/Avatar";
import type { Workspace } from "@/data/fixtures";
import { workspaces } from "@/data/fixtures";

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 6.5 8 10l3.5-3.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-brand"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3.5 8.5 3 3 6-7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3.5v9M3.5 8h9" />
    </svg>
  );
}

interface WorkspaceSwitcherProps {
  workspace: Workspace;
}

export default function WorkspaceSwitcher({
  workspace,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectWorkspace(id: string) {
    setOpen(false);
    navigate(`/workspaces/${id}`);
  }

  return (
    <div ref={containerRef} className="relative border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 p-3 text-left transition-colors hover:bg-subtle"
      >
        <Avatar name={workspace.name} size="lg" shape="square" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {workspace.name}
          </span>
          <span className="block text-xs capitalize text-ink-muted">
            {workspace.role}
          </span>
        </span>
        <ChevronDownIcon open={open} />
      </button>

      {open && (
        <div className="absolute top-full right-2 left-2 z-10 mt-1 rounded-card border border-line-strong bg-surface p-1">
          <p className="px-2 py-1.5 text-xs font-medium text-ink-faint">
            Your workspaces
          </p>

          <ul className="flex flex-col gap-0.5">
            {workspaces.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectWorkspace(item.id)}
                  className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left transition-colors hover:bg-subtle"
                >
                  <Avatar name={item.name} size="sm" shape="square" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ink">{item.name}</span>
                    <span className="block text-xs capitalize text-ink-muted">
                      {item.role}
                    </span>
                  </span>
                  {item.id === workspace.id && <CheckIcon />}
                </button>
              </li>
            ))}
          </ul>

          <div className="my-1 border-t border-line" />

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
          >
            <PlusIcon />
            Create workspace
          </button>
        </div>
      )}
    </div>
  );
}

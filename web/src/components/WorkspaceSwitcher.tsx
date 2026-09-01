import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import Avatar from "@/components/ui/Avatar";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@/components/ui/icons";
import {
  useWorkspaces,
  type Workspace,
} from "@/workspaces/useWorkspaces";




interface WorkspaceSwitcherProps {
  workspace: Workspace | undefined;
}

export default function WorkspaceSwitcher({
  workspace,
}: WorkspaceSwitcherProps) {
  const { data: workspaces } = useWorkspaces();
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
        <Avatar name={workspace?.name ?? "?"} size="lg" shape="square" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {workspace?.name ?? "Loading…"}
          </span>
          <span className="block text-xs capitalize text-ink-muted">
            {workspace?.role ?? ""}
          </span>
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-2 left-2 z-10 mt-1 rounded-card border border-line-strong bg-surface p-1">
          <p className="px-2 py-1.5 text-xs font-medium text-ink-faint">
            Your workspaces
          </p>

          <ul className="flex flex-col gap-0.5">
            {(workspaces ?? []).map((item) => (
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
                  {item.id === workspace?.id && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-brand" />
                  )}
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

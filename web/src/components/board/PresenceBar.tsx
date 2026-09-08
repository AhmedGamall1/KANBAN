import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import type { PresenceUser } from "@/realtime/socket";

const MAX_VISIBLE = 3;

interface PresenceBarProps {
  users: PresenceUser[];
}

export default function PresenceBar({ users }: PresenceBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const visible = users.slice(0, MAX_VISIBLE);
  const hidden = users.length - visible.length;

  return (
    <div
      ref={containerRef}
      className="relative flex shrink-0 items-center gap-2"
    >
      <div className="flex -space-x-1.5">
        {visible.map((user) => (
          <span
            key={user.id}
            title={user.name}
            className="inline-flex rounded-full outline-2 outline-surface"
          >
            <Avatar
              name={user.name}
              src={user.avatarUrl}
              color={user.avatarColor}
            />
          </span>
        ))}

        {hidden > 0 && (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`Show all ${users.length} viewers`}
            onClick={() => setOpen((previous) => !previous)}
            className="inline-flex h-7 w-7 items-center cursor-pointer justify-center rounded-full bg-subtle text-xs font-semibold text-ink-muted outline-2 outline-surface transition-colors hover:bg-line hover:text-ink"
          >
            +{hidden}
          </button>
        )}
      </div>

      <span
        className="text-sm text-ink-muted cursor-pointer"
        onClick={() => setOpen((previous) => !previous)}
      >
        {users.length} viewing
      </span>

      {open && hidden > 0 && (
        <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-card border border-line-strong bg-surface p-1">
          <p className="px-2 py-1.5 text-xs font-medium text-ink-faint">
            On this board
          </p>

          <ul className="flex max-h-64 flex-col gap-0.5 overflow-y-auto">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center gap-2 rounded-control px-2 py-1.5"
              >
                <Avatar
                  name={user.name}
                  src={user.avatarUrl}
                  color={user.avatarColor}
                  size="sm"
                />
                <span className="min-w-0 flex-1 truncate text-ink">
                  {user.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

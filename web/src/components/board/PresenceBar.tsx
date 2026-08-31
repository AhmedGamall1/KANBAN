import Avatar from "@/components/ui/Avatar";
import type { PresenceUser } from "@/data/fixtures";

const MAX_VISIBLE = 3;

interface PresenceBarProps {
  users: PresenceUser[];
}

export default function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) {
    return null;
  }

  const visible = users.slice(0, MAX_VISIBLE);
  const hidden = users.length - visible.length;

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex -space-x-1.5">
        {visible.map((user) => (
          <span
            key={user.userId}
            className="inline-flex rounded-full outline-2 outline-surface"
          >
            <Avatar name={user.name} color={user.avatarColor} />
          </span>
        ))}

        {hidden > 0 && (
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-xs font-semibold text-ink-muted outline-2 outline-surface"
            title={users
              .slice(MAX_VISIBLE)
              .map((user) => user.name)
              .join(", ")}
          >
            +{hidden}
          </span>
        )}
      </div>

      <span className="text-sm text-ink-muted">
        {users.length} viewing
      </span>
    </div>
  );
}

import type { PresenceUser } from "@/realtime/socket";
import type { Cursor } from "@/realtime/useBoardSocket";

interface CursorLayerProps {
  cursors: Record<string, Cursor>;
  presence: PresenceUser[];
}

export default function CursorLayer({ cursors, presence }: CursorLayerProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {presence.map((user) => {
        const cursor = cursors[user.id];

        if (!cursor) {
          return null;
        }

        return (
          <div
            key={user.id}
            className="absolute -translate-y-0.5 transition-[left,top] duration-75 ease-linear"
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%` }}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill={user.avatarColor}
              aria-hidden="true"
            >
              <path d="M2 1.5 12.5 8 8 9 6 14z" />
            </svg>

            <span
              className="mt-0.5 ml-3 inline-block rounded-control px-1.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: user.avatarColor }}
            >
              {user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

import type { SocketStatus } from "@/realtime/useBoardSocket";

interface ConnectionStatusProps {
  status: SocketStatus;
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === "live") {
    return null;
  }

  const offline = status === "offline";

  return (
    <span
      role="status"
      className={[
        "shrink-0 rounded-control px-2 py-1 text-sm",
        offline ? "bg-danger-soft text-danger" : "bg-subtle text-ink-muted",
      ].join(" ")}
    >
      {offline ? "Reconnecting…" : "Connecting…"}
    </span>
  );
}

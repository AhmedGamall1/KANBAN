import Avatar from "@/components/ui/Avatar";
import type { Card, CardLabel, Member } from "@/data/fixtures";

const labelDotClasses: Record<CardLabel, string> = {
  infra: "bg-label-infra",
  db: "bg-label-db",
  frontend: "bg-label-frontend",
  bug: "bg-label-bug",
  chore: "bg-label-chore",
};

interface BoardCardProps {
  card: Card;
  assignee?: Member;
  editor?: Member;
  onOpen: () => void;
}

export default function BoardCard({
  card,
  assignee,
  editor,
  onOpen,
}: BoardCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "block w-full rounded-card border bg-surface p-3 text-left transition-colors",
        editor ? "border-brand" : "border-line hover:border-line-strong",
      ].join(" ")}
    >
      {card.label && (
        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${labelDotClasses[card.label]}`}
          />
          {card.label}
        </p>
      )}

      <p className="text-ink">{card.title}</p>

      {editor && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-brand">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          {editor.name} is editing
        </p>
      )}

      {assignee && (
        <div className="mt-2.5 flex justify-end">
          <Avatar name={assignee.name} color={assignee.avatarColor} size="sm" />
        </div>
      )}
    </button>
  );
}

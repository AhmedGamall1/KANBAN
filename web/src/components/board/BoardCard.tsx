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
}

export default function BoardCard({ card, assignee }: BoardCardProps) {
  return (
    <article className="rounded-card border border-line bg-surface p-3 transition-colors hover:border-line-strong">
      {card.label && (
        <p className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-muted">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${labelDotClasses[card.label]}`}
          />
          {card.label}
        </p>
      )}

      <p className="text-ink">{card.title}</p>

      {assignee && (
        <div className="mt-2.5 flex justify-end">
          <Avatar name={assignee.name} color={assignee.avatarColor} size="sm" />
        </div>
      )}
    </article>
  );
}

import { PointerActivationConstraints } from "@dnd-kit/dom";
import { PointerSensor } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import Avatar from "@/components/ui/Avatar";
import type { Card, CardLabel } from "@/boards/useBoard";
import type { Member } from "@/workspaces/useMembers";

const dragOnlyAfterMoving = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 5 }),
    ],
  }),
];

const labelDotClasses: Record<CardLabel, string> = {
  infra: "bg-label-infra",
  db: "bg-label-db",
  frontend: "bg-label-frontend",
  bug: "bg-label-bug",
  chore: "bg-label-chore",
};

interface BoardCardProps {
  card: Card;
  index: number;
  columnId: string;
  assignee?: Member;
  editor?: Member;
  canDrag: boolean;
  onOpen: () => void;
}

export default function BoardCard({
  card,
  index,
  columnId,
  assignee,
  editor,
  canDrag,
  onOpen,
}: BoardCardProps) {
  const { ref, isDragging } = useSortable({
    id: card.id,
    index,
    group: columnId,
    type: "card",
    accept: "card",
    disabled: !canDrag,
    sensors: dragOnlyAfterMoving,
  });

  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      className={[
        "block w-full rounded-card border bg-surface p-3 text-left transition-colors",
        editor ? "border-brand" : "border-line hover:border-line-strong",
        canDrag ? "cursor-grab active:cursor-grabbing" : "",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      {(card.label || assignee) && (
        <div className="mb-1.5 flex items-center gap-2">
          {card.label && (
            <span className="flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${labelDotClasses[card.label]}`}
              />
              <span className="truncate">{card.label}</span>
            </span>
          )}

          {assignee && (
            <span className="ml-auto">
              <Avatar
                name={assignee.name}
                src={assignee.avatarUrl}
                color={assignee.avatarColor}
                size="sm"
              />
            </span>
          )}
        </div>
      )}

      <p className="font-medium text-ink">{card.title}</p>

      {card.description && (
        <p className="mt-1 line-clamp-1 text-sm text-ink-muted">
          {card.description}
        </p>
      )}

      {editor && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-brand">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span className="truncate">{editor.name} is editing</span>
        </p>
      )}
    </button>
  );
}

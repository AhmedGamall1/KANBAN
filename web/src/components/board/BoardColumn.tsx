import BoardCard from "@/components/board/BoardCard";
import { PlusIcon } from "@/components/ui/icons";
import type { Card, Column, Member } from "@/data/fixtures";

interface BoardColumnProps {
  column: Column;
  cards: Card[];
  membersById: Record<string, Member>;
  canEdit: boolean;
}

export default function BoardColumn({
  column,
  cards,
  membersById,
  canEdit,
}: BoardColumnProps) {
  return (
    <section className="flex max-h-full w-72 shrink-0 flex-col rounded-card border border-line bg-subtle">
      <header className="flex items-center gap-2 px-3 py-2.5">
        <h2 className="min-w-0 flex-1 truncate font-medium text-ink">
          {column.name}
        </h2>
        <span className="text-xs text-ink-muted">{cards.length}</span>
      </header>

      <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto px-2">
        {cards.map((card) => (
          <li key={card.id}>
            <BoardCard
              card={card}
              assignee={
                card.assigneeId ? membersById[card.assigneeId] : undefined
              }
            />
          </li>
        ))}
      </ul>

      {canEdit ? (
        <button
          type="button"
          className="m-2 flex items-center gap-1.5 rounded-control px-2 py-1.5 text-left text-ink-muted transition-colors hover:bg-line hover:text-ink"
        >
          <PlusIcon />
          Add a card
        </button>
      ) : (
        <div className="h-2" />
      )}
    </section>
  );
}

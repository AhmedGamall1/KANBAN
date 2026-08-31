import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import BoardCard from "@/components/board/BoardCard";
import { PlusIcon } from "@/components/ui/icons";
import type { Card, Column, Member } from "@/data/fixtures";

interface BoardColumnProps {
  column: Column;
  index: number;
  cards: Card[];
  membersById: Record<string, Member>;
  canEdit: boolean;
  editingCards: Record<string, string>;
  onOpenCard: (cardId: string) => void;
}

export default function BoardColumn({
  column,
  index,
  cards,
  membersById,
  canEdit,
  editingCards,
  onOpenCard,
}: BoardColumnProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: column.id,
    index,
    type: "column",
    accept: ["card", "column"],
    collisionPriority: CollisionPriority.Low,
    disabled: !canEdit,
  });

  return (
    <section
      ref={ref}
      className={[
        "flex max-h-full w-72 shrink-0 flex-col rounded-card border border-line bg-subtle",
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <header
        ref={handleRef}
        className={[
          "flex items-center gap-2 px-3 py-2.5",
          canEdit ? "cursor-grab active:cursor-grabbing" : "",
        ].join(" ")}
      >
        <h2 className="min-w-0 flex-1 truncate font-medium text-ink">
          {column.name}
        </h2>
        <span className="text-xs text-ink-muted">{cards.length}</span>
      </header>

      <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto px-2">
        {cards.map((card, cardIndex) => (
          <li key={card.id}>
            <BoardCard
              card={card}
              index={cardIndex}
              columnId={column.id}
              assignee={
                card.assigneeId ? membersById[card.assigneeId] : undefined
              }
              editor={membersById[editingCards[card.id]]}
              canDrag={canEdit}
              onOpen={() => onOpenCard(card.id)}
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

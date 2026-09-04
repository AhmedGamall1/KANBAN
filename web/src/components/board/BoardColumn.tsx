import { CollisionPriority } from "@dnd-kit/abstract";
import { useSortable } from "@dnd-kit/react/sortable";
import { useState, type SubmitEvent } from "react";
import BoardCard from "@/components/board/BoardCard";
import Button from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/icons";
import type { Card, Column } from "@/boards/useBoard";
import type { Member } from "@/workspaces/useMembers";

interface BoardColumnProps {
  column: Column;
  index: number;
  cards: Card[];
  membersById: Record<string, Member>;
  canEdit: boolean;
  editingCards: Record<string, string>;
  addingCard: boolean;
  addError?: string;
  onAddCard: (columnId: string, title: string) => Promise<unknown>;
  onOpenCard: (cardId: string) => void;
}

export default function BoardColumn({
  column,
  index,
  cards,
  membersById,
  canEdit,
  editingCards,
  addingCard,
  addError,
  onAddCard,
  onOpenCard,
}: BoardColumnProps) {
  const [composing, setComposing] = useState(false);
  const [title, setTitle] = useState("");
  const { ref, handleRef, isDragging } = useSortable({
    id: column.id,
    index,
    type: "column",
    accept: ["card", "column"],
    collisionPriority: CollisionPriority.Low,
    disabled: !canEdit,
  });

  function closeComposer() {
    setComposing(false);
    setTitle("");
  }

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = title.trim();

    if (value) {
      void onAddCard(column.id, value).then(
        () => setTitle(""),
        () => undefined,
      );
    }
  }

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

      {!canEdit ? (
        <div className="h-2" />
      ) : composing ? (
        <form className="m-2 flex flex-col gap-2" onSubmit={submit}>
          <textarea
            autoFocus
            rows={2}
            value={title}
            placeholder="What needs doing?"
            aria-label={`New card in ${column.name}`}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }

              if (event.key === "Escape") {
                closeComposer();
              }
            }}
            className="w-full resize-none rounded-card border border-line bg-surface px-3 py-2 text-ink outline-none placeholder:text-ink-faint focus:border-brand"
          />

          {addError && (
            <p className="rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
              {addError}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={addingCard || !title.trim()}
            >
              {addingCard ? "Adding…" : "Add card"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeComposer}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="m-2 flex items-center gap-1.5 rounded-control px-2 py-1.5 text-left text-ink-muted transition-colors hover:bg-line hover:text-ink"
        >
          <PlusIcon />
          Add a card
        </button>
      )}
    </section>
  );
}

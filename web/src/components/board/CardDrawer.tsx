import { useEffect, useRef } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import { CloseIcon } from "@/components/ui/icons";
import type { Card, CardLabel, Column } from "@/boards/useBoard";
import { activity, type ActivityEntry, type CardChanges } from "@/data/fixtures";
import { relativeTime } from "@/lib/relativeTime";
import type { Member } from "@/workspaces/useMembers";

const LABELS: CardLabel[] = ["infra", "db", "frontend", "bug", "chore"];

function joinPhrases(phrases: string[]): string {
  if (phrases.length <= 1) {
    return phrases[0] ?? "";
  }

  return `${phrases.slice(0, -1).join(", ")} and ${phrases[phrases.length - 1]}`;
}

function describeChanges(
  changes: CardChanges,
  actorId: string,
  membersById: Record<string, Member>,
): string {
  const phrases: string[] = [];

  if (changes.title !== undefined) {
    phrases.push(`renamed it to "${changes.title}"`);
  }

  if (changes.description !== undefined) {
    phrases.push(
      changes.description === null
        ? "removed the description"
        : "updated the description",
    );
  }

  if (changes.assigneeId !== undefined) {
    if (changes.assigneeId === null) {
      phrases.push("cleared the assignee");
    } else if (changes.assigneeId === actorId) {
      phrases.push("assigned it to themselves");
    } else {
      const assignee = membersById[changes.assigneeId]?.name ?? "someone";
      phrases.push(`assigned it to ${assignee}`);
    }
  }

  if (changes.label !== undefined) {
    phrases.push(
      changes.label === null
        ? "removed the label"
        : `labelled it ${changes.label}`,
    );
  }

  return joinPhrases(phrases) || "updated this card";
}

function describeActivity(
  entry: ActivityEntry,
  columnsById: Record<string, Column>,
  membersById: Record<string, Member>,
): string {
  switch (entry.type) {
    case "card_created":
      return "created this card";
    case "card_moved":
      return `moved it to ${columnsById[entry.payload.columnId]?.name ?? "another column"}`;
    case "card_updated":
      return describeChanges(
        entry.payload.changes,
        entry.actor.id,
        membersById,
      );
  }
}


interface CardDrawerProps {
  card: Card;
  column?: Column;
  columnsById: Record<string, Column>;
  membersById: Record<string, Member>;
  boardMembers: Member[];
  canEdit: boolean;
  onClose: () => void;
}

export default function CardDrawer({
  card,
  column,
  columnsById,
  membersById,
  boardMembers,
  canEdit,
  onClose,
}: CardDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const entries = activity
    .filter((entry) => entry.cardId === card.id)
    .sort((a, b) => Number(b.seq) - Number(a.seq));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-y-0 right-0 m-0 max-h-none w-full max-w-md border-l border-line bg-surface p-0 text-ink backdrop:bg-ink/20"
    >
      <div className="flex h-full flex-col">
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-muted">
              In {column?.name ?? "this board"}
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
              {card.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-control p-1.5 text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assignee"
              defaultValue={card.assigneeId ?? ""}
              disabled={!canEdit}
            >
              <option value="">Unassigned</option>
              {boardMembers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name}
                </option>
              ))}
            </Select>

            <Select
              label="Label"
              defaultValue={card.label ?? ""}
              disabled={!canEdit}
            >
              <option value="">No label</option>
              {LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          <section className="mt-6">
            <h3 className="text-sm font-medium text-ink">Description</h3>
            <p className="mt-1.5 whitespace-pre-line text-ink-muted">
              {card.description ?? "No description yet."}
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-medium text-ink">Activity</h3>

            {entries.length === 0 ? (
              <p className="mt-1.5 text-ink-muted">Nothing has happened yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {entries.map((entry) => (
                  <li key={entry.seq} className="flex gap-2.5">
                    <Avatar
                      name={entry.actor.name}
                      color={entry.actor.avatarColor}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-ink">
                        <span className="font-medium">{entry.actor.name}</span>{" "}
                        {describeActivity(entry, columnsById, membersById)}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {relativeTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {canEdit && (
          <footer className="shrink-0 border-t border-line px-5 py-3">
            <Button variant="danger-ghost" size="sm">
              Delete card
            </Button>
          </footer>
        )}
      </div>
    </dialog>
  );
}

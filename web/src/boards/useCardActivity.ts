import { useQuery } from "@tanstack/react-query";
import type { CardLabel } from "@/boards/useBoard";
import { api } from "@/lib/api";

export interface CardChanges {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  label?: CardLabel | null;
}

export type ActivityEntry = {
  seq: string;
  createdAt: string;
  actor: { id: string; name: string; avatarColor: string };
} & (
  | { type: "card_created"; payload: { cardId: string } }
  | { type: "card_updated"; payload: { cardId: string; changes: CardChanges } }
  | { type: "card_moved"; payload: { cardId: string; columnId: string } }
  | { type: "card_deleted"; payload: { cardId: string; title: string } }
);

export function cardActivityQueryKey(cardId: string) {
  return ["cards", cardId, "activity"] as const;
}

export function useCardActivity(cardId: string | undefined) {
  return useQuery({
    queryKey: cardActivityQueryKey(cardId ?? ""),
    queryFn: async () => {
      const { activity } = await api.get<{ activity: ActivityEntry[] }>(
        `/cards/${cardId}/activity`,
      );

      return activity;
    },
    enabled: Boolean(cardId),
  });
}

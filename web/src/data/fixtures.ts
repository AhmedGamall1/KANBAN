import type { CardLabel } from "@/boards/useBoard";

export const inviteLinks: Record<string, string> = {
  acme: "http://localhost:5173/invite/k3f9qs2xva7m",
  opensource: "http://localhost:5173/invite/p7wd4nc1ehzt",
  design: "http://localhost:5173/invite/b2ym8rk6ju4q",
};

export interface CardChanges {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  label?: CardLabel | null;
}

export type ActivityEntry = {
  seq: string;
  cardId: string;
  createdAt: string;
  actor: { id: string; name: string; avatarColor: string };
} & (
  | { type: "card_created"; payload: { cardId: string } }
  | { type: "card_updated"; payload: { cardId: string; changes: CardChanges } }
  | { type: "card_moved"; payload: { cardId: string; columnId: string } }
);

export const activity: ActivityEntry[] = [
  {
    seq: "1401",
    cardId: "card-argon",
    type: "card_created",
    payload: { cardId: "card-argon" },
    createdAt: "2026-08-02T09:14:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1402",
    cardId: "card-compositefk",
    type: "card_created",
    payload: { cardId: "card-compositefk" },
    createdAt: "2026-08-03T11:02:00Z",
    actor: { id: "user-omar", name: "Omar Haddad", avatarColor: "#0891b2" },
  },
  {
    seq: "1403",
    cardId: "card-handshake",
    type: "card_created",
    payload: { cardId: "card-handshake" },
    createdAt: "2026-08-05T10:30:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1404",
    cardId: "card-argon",
    type: "card_moved",
    payload: { cardId: "card-argon", columnId: "col-done" },
    createdAt: "2026-08-10T16:45:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1405",
    cardId: "card-compositefk",
    type: "card_moved",
    payload: { cardId: "card-compositefk", columnId: "col-done" },
    createdAt: "2026-08-14T13:20:00Z",
    actor: { id: "user-omar", name: "Omar Haddad", avatarColor: "#0891b2" },
  },
  {
    seq: "1406",
    cardId: "card-ratelimit",
    type: "card_created",
    payload: { cardId: "card-ratelimit" },
    createdAt: "2026-08-12T08:55:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1407",
    cardId: "card-redis",
    type: "card_created",
    payload: { cardId: "card-redis" },
    createdAt: "2026-08-12T09:03:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1408",
    cardId: "card-rls",
    type: "card_created",
    payload: { cardId: "card-rls" },
    createdAt: "2026-08-14T15:41:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1409",
    cardId: "card-presence",
    type: "card_created",
    payload: { cardId: "card-presence" },
    createdAt: "2026-08-15T10:12:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1410",
    cardId: "card-handshake",
    type: "card_moved",
    payload: { cardId: "card-handshake", columnId: "col-done" },
    createdAt: "2026-08-16T17:08:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1411",
    cardId: "card-emptystate",
    type: "card_created",
    payload: { cardId: "card-emptystate" },
    createdAt: "2026-08-18T11:37:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1412",
    cardId: "card-drawer",
    type: "card_created",
    payload: { cardId: "card-drawer" },
    createdAt: "2026-08-19T09:48:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1413",
    cardId: "card-fractional",
    type: "card_created",
    payload: { cardId: "card-fractional" },
    createdAt: "2026-08-20T14:15:00Z",
    actor: { id: "user-omar", name: "Omar Haddad", avatarColor: "#0891b2" },
  },
  {
    seq: "1414",
    cardId: "card-redis",
    type: "card_updated",
    payload: { cardId: "card-redis", changes: { assigneeId: "user-omar" } },
    createdAt: "2026-08-20T14:52:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1415",
    cardId: "card-pgbouncer",
    type: "card_created",
    payload: { cardId: "card-pgbouncer" },
    createdAt: "2026-08-21T10:05:00Z",
    actor: { id: "user-omar", name: "Omar Haddad", avatarColor: "#0891b2" },
  },
  {
    seq: "1416",
    cardId: "card-migrations",
    type: "card_created",
    payload: { cardId: "card-migrations" },
    createdAt: "2026-08-22T09:31:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1417",
    cardId: "card-compose",
    type: "card_created",
    payload: { cardId: "card-compose" },
    createdAt: "2026-08-23T16:20:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1418",
    cardId: "card-drawer",
    type: "card_moved",
    payload: { cardId: "card-drawer", columnId: "col-progress" },
    createdAt: "2026-08-25T10:22:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1419",
    cardId: "card-drawer",
    type: "card_updated",
    payload: { cardId: "card-drawer", changes: { label: "frontend" } },
    createdAt: "2026-08-25T10:23:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1420",
    cardId: "card-fractional",
    type: "card_moved",
    payload: { cardId: "card-fractional", columnId: "col-progress" },
    createdAt: "2026-08-26T08:44:00Z",
    actor: { id: "user-omar", name: "Omar Haddad", avatarColor: "#0891b2" },
  },
  {
    seq: "1421",
    cardId: "card-cursor",
    type: "card_created",
    payload: { cardId: "card-cursor" },
    createdAt: "2026-08-27T13:59:00Z",
    actor: { id: "user-tom", name: "Tom Reyes", avatarColor: "#d97706" },
  },
  {
    seq: "1422",
    cardId: "card-drawer",
    type: "card_updated",
    payload: { cardId: "card-drawer", changes: { description: "…" } },
    createdAt: "2026-08-28T15:06:00Z",
    actor: { id: "user-lena", name: "Lena Fischer", avatarColor: "#c026d3" },
  },
  {
    seq: "1423",
    cardId: "card-cursor",
    type: "card_updated",
    payload: { cardId: "card-cursor", changes: { title: "Cursors lag behind on a slow connection" } },
    createdAt: "2026-08-28T16:31:00Z",
    actor: { id: "user-tom", name: "Tom Reyes", avatarColor: "#d97706" },
  },
  {
    seq: "1424",
    cardId: "card-presence",
    type: "card_moved",
    payload: { cardId: "card-presence", columnId: "col-review" },
    createdAt: "2026-08-29T09:17:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
  {
    seq: "1425",
    cardId: "card-cursor",
    type: "card_moved",
    payload: { cardId: "card-cursor", columnId: "col-review" },
    createdAt: "2026-08-29T09:52:00Z",
    actor: { id: "user-tom", name: "Tom Reyes", avatarColor: "#d97706" },
  },
  {
    seq: "1426",
    cardId: "card-presence",
    type: "card_updated",
    payload: { cardId: "card-presence", changes: { assigneeId: "user-sara" } },
    createdAt: "2026-08-29T10:04:00Z",
    actor: { id: "user-sara", name: "Sara Malik", avatarColor: "#4f46e5" },
  },
];

export interface PresenceUser {
  boardId: string;
  userId: string;
  name: string;
  avatarColor: string;
}

export const presence: PresenceUser[] = [
  {
    boardId: "roadmap",
    userId: "user-sara",
    name: "Sara Malik",
    avatarColor: "#4f46e5",
  },
  {
    boardId: "roadmap",
    userId: "user-omar",
    name: "Omar Haddad",
    avatarColor: "#0891b2",
  },
  {
    boardId: "roadmap",
    userId: "user-lena",
    name: "Lena Fischer",
    avatarColor: "#c026d3",
  },
  {
    boardId: "roadmap",
    userId: "user-tom",
    name: "Tom Reyes",
    avatarColor: "#d97706",
  },
  {
    boardId: "platform",
    userId: "user-sara",
    name: "Sara Malik",
    avatarColor: "#4f46e5",
  },
];

export const editingCards: Record<string, string> = {
  "card-fractional": "user-omar",
};

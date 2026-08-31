export type Role = "owner" | "member" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface Workspace {
  id: string;
  name: string;
  role: Role;
}

export interface Board {
  id: string;
  workspaceId: string;
  name: string;
}

export interface Member {
  workspaceId: string;
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: Role;
  joinedAt: string;
}

export const currentUser: User = {
  id: "user-sara",
  name: "Sara Malik",
  email: "sara@acme.io",
  avatarColor: "#4f46e5",
};

export const workspaces: Workspace[] = [
  { id: "acme", name: "Acme product", role: "owner" },
  { id: "opensource", name: "Open source", role: "member" },
  { id: "design", name: "Design guild", role: "viewer" },
];

export const boards: Board[] = [
  { id: "roadmap", workspaceId: "acme", name: "Q3 roadmap" },
  { id: "platform", workspaceId: "acme", name: "Platform migration" },
  { id: "triage", workspaceId: "acme", name: "Bug triage" },
  { id: "website", workspaceId: "opensource", name: "Website redesign" },
  { id: "brand", workspaceId: "design", name: "Brand refresh" },
  { id: "icons", workspaceId: "design", name: "Icon set" },
];

export const members: Member[] = [
  {
    workspaceId: "acme",
    userId: "user-sara",
    name: "Sara Malik",
    email: "sara@acme.io",
    avatarColor: "#4f46e5",
    role: "owner",
    joinedAt: "2026-05-04",
  },
  {
    workspaceId: "acme",
    userId: "user-omar",
    name: "Omar Haddad",
    email: "omar@acme.io",
    avatarColor: "#0891b2",
    role: "member",
    joinedAt: "2026-05-19",
  },
  {
    workspaceId: "acme",
    userId: "user-lena",
    name: "Lena Fischer",
    email: "lena@acme.io",
    avatarColor: "#c026d3",
    role: "member",
    joinedAt: "2026-06-02",
  },
  {
    workspaceId: "acme",
    userId: "user-tom",
    name: "Tom Reyes",
    email: "tom@acme.io",
    avatarColor: "#d97706",
    role: "viewer",
    joinedAt: "2026-07-11",
  },
  {
    workspaceId: "opensource",
    userId: "user-priya",
    name: "Priya Nair",
    email: "priya@opensource.dev",
    avatarColor: "#65a30d",
    role: "owner",
    joinedAt: "2026-03-16",
  },
  {
    workspaceId: "opensource",
    userId: "user-sara",
    name: "Sara Malik",
    email: "sara@acme.io",
    avatarColor: "#4f46e5",
    role: "member",
    joinedAt: "2026-04-28",
  },
  {
    workspaceId: "opensource",
    userId: "user-marco",
    name: "Marco Rossi",
    email: "marco@opensource.dev",
    avatarColor: "#e11d48",
    role: "member",
    joinedAt: "2026-06-21",
  },
  {
    workspaceId: "design",
    userId: "user-elena",
    name: "Elena Petrova",
    email: "elena@designguild.co",
    avatarColor: "#c026d3",
    role: "owner",
    joinedAt: "2026-02-09",
  },
  {
    workspaceId: "design",
    userId: "user-sara",
    name: "Sara Malik",
    email: "sara@acme.io",
    avatarColor: "#4f46e5",
    role: "viewer",
    joinedAt: "2026-08-01",
  },
];

export const inviteLinks: Record<string, string> = {
  acme: "http://localhost:5173/invite/k3f9qs2xva7m",
  opensource: "http://localhost:5173/invite/p7wd4nc1ehzt",
  design: "http://localhost:5173/invite/b2ym8rk6ju4q",
};

export type CardLabel = "infra" | "db" | "frontend" | "bug" | "chore";

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: string;
}

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  label: CardLabel | null;
  position: string;
}

export const columns: Column[] = [
  { id: "col-backlog", boardId: "roadmap", name: "Backlog", position: "1" },
  { id: "col-progress", boardId: "roadmap", name: "In progress", position: "2" },
  { id: "col-review", boardId: "roadmap", name: "In review", position: "3" },
  { id: "col-done", boardId: "roadmap", name: "Done", position: "4" },
  { id: "col-plat-todo", boardId: "platform", name: "To do", position: "1" },
  { id: "col-plat-doing", boardId: "platform", name: "Doing", position: "2" },
  { id: "col-plat-done", boardId: "platform", name: "Done", position: "3" },
];

export const cards: Card[] = [
  {
    id: "card-ratelimit",
    boardId: "roadmap",
    columnId: "col-backlog",
    title: "Rate limiting on the login endpoint",
    description:
      "Nothing stops unlimited password attempts today. Decide between nginx at the edge and @nestjs/throttler in the app.",
    assigneeId: null,
    label: "infra",
    position: "1",
  },
  {
    id: "card-redis",
    boardId: "roadmap",
    columnId: "col-backlog",
    title: "Move sessions into Redis",
    description:
      "Auth costs one database query per request. Redis arrives anyway for socket fan-out, so the lookup can move with it.",
    assigneeId: "user-omar",
    label: "infra",
    position: "2",
  },
  {
    id: "card-rls",
    boardId: "roadmap",
    columnId: "col-backlog",
    title: "Audit the RLS policies on board_events",
    description: null,
    assigneeId: "user-sara",
    label: "db",
    position: "3",
  },
  {
    id: "card-emptystate",
    boardId: "roadmap",
    columnId: "col-backlog",
    title: "Empty state for a workspace with no boards",
    description: null,
    assigneeId: null,
    label: "frontend",
    position: "4",
  },
  {
    id: "card-drawer",
    boardId: "roadmap",
    columnId: "col-progress",
    title: "Card drawer with the activity feed",
    description:
      "Reads GET /cards/:id/activity. Every row is one board_events entry rendered as a human sentence.",
    assigneeId: "user-lena",
    label: "frontend",
    position: "1",
  },
  {
    id: "card-fractional",
    boardId: "roadmap",
    columnId: "col-progress",
    title: "Fractional ordering for column positions",
    description:
      "Same midpoint maths the cards already use, so one move rewrites one row instead of every sibling.",
    assigneeId: "user-omar",
    label: "db",
    position: "2",
  },
  {
    id: "card-presence",
    boardId: "roadmap",
    columnId: "col-review",
    title: "Presence avatars on the board header",
    description: "Derived from room membership, never stored.",
    assigneeId: "user-sara",
    label: "frontend",
    position: "1",
  },
  {
    id: "card-cursor",
    boardId: "roadmap",
    columnId: "col-review",
    title: "Cursors lag behind on a slow connection",
    description:
      "Relay is already volatile, so frames drop rather than queue. Check the 20/sec throttle on the sending side.",
    assigneeId: "user-tom",
    label: "bug",
    position: "2",
  },
  {
    id: "card-handshake",
    boardId: "roadmap",
    columnId: "col-done",
    title: "Socket handshake authentication",
    description: null,
    assigneeId: "user-sara",
    label: "infra",
    position: "1",
  },
  {
    id: "card-compositefk",
    boardId: "roadmap",
    columnId: "col-done",
    title: "Composite foreign keys on cards",
    description: null,
    assigneeId: "user-omar",
    label: "db",
    position: "2",
  },
  {
    id: "card-argon",
    boardId: "roadmap",
    columnId: "col-done",
    title: "Argon2id password hashing",
    description: null,
    assigneeId: "user-lena",
    label: "chore",
    position: "3",
  },
  {
    id: "card-pgbouncer",
    boardId: "platform",
    columnId: "col-plat-todo",
    title: "Evaluate PgBouncer for the connection pool",
    description: null,
    assigneeId: "user-omar",
    label: "infra",
    position: "1",
  },
  {
    id: "card-migrations",
    boardId: "platform",
    columnId: "col-plat-doing",
    title: "Forward-only migration runner",
    description: null,
    assigneeId: "user-sara",
    label: "db",
    position: "1",
  },
  {
    id: "card-compose",
    boardId: "platform",
    columnId: "col-plat-done",
    title: "Two API instances in Compose",
    description: null,
    assigneeId: null,
    label: "chore",
    position: "1",
  },
];

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

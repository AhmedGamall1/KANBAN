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

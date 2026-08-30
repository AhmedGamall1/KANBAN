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

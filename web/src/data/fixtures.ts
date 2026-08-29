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
];

export const boards: Board[] = [
  { id: "roadmap", workspaceId: "acme", name: "Q3 roadmap" },
  { id: "platform", workspaceId: "acme", name: "Platform migration" },
  { id: "triage", workspaceId: "acme", name: "Bug triage" },
  { id: "website", workspaceId: "opensource", name: "Website redesign" },
];

export const members: Member[] = [
  {
    userId: "user-sara",
    name: "Sara Malik",
    email: "sara@acme.io",
    avatarColor: "#4f46e5",
    role: "owner",
    joinedAt: "2026-05-04",
  },
  {
    userId: "user-omar",
    name: "Omar Haddad",
    email: "omar@acme.io",
    avatarColor: "#0891b2",
    role: "member",
    joinedAt: "2026-05-19",
  },
  {
    userId: "user-lena",
    name: "Lena Fischer",
    email: "lena@acme.io",
    avatarColor: "#c026d3",
    role: "member",
    joinedAt: "2026-06-02",
  },
  {
    userId: "user-tom",
    name: "Tom Reyes",
    email: "tom@acme.io",
    avatarColor: "#d97706",
    role: "viewer",
    joinedAt: "2026-07-11",
  },
];

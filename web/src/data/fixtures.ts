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

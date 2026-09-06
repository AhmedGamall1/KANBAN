import { io, type Socket } from "socket.io-client";
import type { Board } from "@/boards/useBoards";
import type { Card, Column } from "@/boards/useBoard";
import type { CardChanges } from "@/boards/useCardActivity";
import type { Role } from "@/workspaces/useWorkspaces";

export interface PresenceUser {
  id: string;
  name: string;
  avatarColor: string;
}

export interface BoardState {
  boardId: string;
  role: Role;
  seq: string;
  presence: PresenceUser[];
  resyncRequired: boolean;
}

export type BoardEvent = {
  seq: string;
  boardId: string;
  actorId: string;
  createdAt: string;
} & (
  | { type: "card_created"; payload: { cardId: string; card: Card } }
  | { type: "card_updated"; payload: { cardId: string; changes: CardChanges } }
  | {
      type: "card_moved";
      payload: { cardId: string; columnId: string; position: string };
    }
  | { type: "card_deleted"; payload: { cardId: string; title: string } }
  | { type: "column_created"; payload: { column: Column } }
  | { type: "column_renamed"; payload: { columnId: string; name: string } }
  | { type: "column_moved"; payload: { columnId: string; position: string } }
  | { type: "column_deleted"; payload: { columnId: string; name: string } }
  | { type: "board_created"; payload: { board: Board } }
  | { type: "board_renamed"; payload: { boardId: string; name: string } }
);

interface ServerToClientEvents {
  "board:state": (state: BoardState) => void;
  "board:event": (event: BoardEvent) => void;
  "presence:update": (payload: { users: PresenceUser[] }) => void;
  "cursor:update": (payload: { userId: string; x: number; y: number }) => void;
  "card:editing": (payload: {
    cardId: string;
    userId: string;
    editing: boolean;
  }) => void;
  "board:error": (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  "board:join": (payload: { boardId: string; after?: string }) => void;
  "board:leave": () => void;
  "cursor:move": (payload: { x: number; y: number }) => void;
  "card:editing": (payload: { cardId: string; editing: boolean }) => void;
}

export type BoardSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: BoardSocket = io({ autoConnect: false });

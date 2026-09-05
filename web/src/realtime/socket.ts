import { io, type Socket } from "socket.io-client";
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

interface ServerToClientEvents {
  "board:state": (state: BoardState) => void;
  "board:error": (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  "board:join": (payload: { boardId: string; after?: string }) => void;
  "board:leave": () => void;
}

export type BoardSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: BoardSocket = io({ autoConnect: false });

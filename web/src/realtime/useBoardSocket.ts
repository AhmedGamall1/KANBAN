import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { boardQueryKey, patchBoard, type BoardData } from "@/boards/useBoard";
import { applyBoardEvent } from "@/realtime/applyBoardEvent";
import {
  socket,
  type BoardEvent,
  type BoardState,
  type PresenceUser,
} from "@/realtime/socket";
import type { Role } from "@/workspaces/useWorkspaces";

export type SocketStatus = "connecting" | "live" | "offline";

export interface Cursor {
  x: number;
  y: number;
}

export function useBoardSocket(boardId: string | undefined) {
  const client = useQueryClient();
  const [status, setStatus] = useState<SocketStatus>(
    socket.connected ? "live" : "connecting",
  );
  const [error, setError] = useState<string | null>(null);
  const [presence, setPresence] = useState<PresenceUser[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [editingCards, setEditingCards] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!boardId) {
      return;
    }

    function join() {
      const board = client.getQueryData<BoardData>(
        boardQueryKey(boardId as string),
      );

      setStatus("live");
      setError(null);
      socket.emit("board:join", {
        boardId: boardId as string,
        after: board?.seq,
      });
    }

    function handleDisconnect() {
      setStatus("offline");
      setPresence([]);
      setCursors({});
      setEditingCards({});
    }

    function handleConnectError() {
      setStatus("offline");
      setError("Cannot reach the live connection.");
    }

    function handleState(state: BoardState) {
      setPresence(state.presence);
      setRole(state.role);

      if (state.resyncRequired) {
        void client.invalidateQueries({
          queryKey: boardQueryKey(state.boardId),
        });

        return;
      }

      for (const event of state.missed) {
        applyBoardEvent(client, event);
      }

      patchBoard(client, state.boardId, (data) =>
        Number(state.seq) > Number(data.seq)
          ? { ...data, seq: state.seq }
          : data,
      );
    }

    function handlePresence(payload: { users: PresenceUser[] }) {
      const present = new Set(payload.users.map((user) => user.id));

      setPresence(payload.users);
      setCursors((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([userId]) => present.has(userId)),
        ),
      );
      setEditingCards((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([, userId]) => present.has(userId)),
        ),
      );
    }

    function handleCursor(payload: { userId: string; x: number; y: number }) {
      setCursors((current) => ({
        ...current,
        [payload.userId]: { x: payload.x, y: payload.y },
      }));
    }

    function handleEditing(payload: {
      cardId: string;
      userId: string;
      editing: boolean;
    }) {
      setEditingCards((current) => {
        const next = { ...current };

        if (payload.editing) {
          next[payload.cardId] = payload.userId;
        } else {
          delete next[payload.cardId];
        }

        return next;
      });
    }

    function handleBoardError(payload: { message: string }) {
      setError(payload.message);
    }

    function handleEvent(event: BoardEvent) {
      applyBoardEvent(client, event);
    }

    socket.on("connect", join);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("board:state", handleState);
    socket.on("board:event", handleEvent);
    socket.on("presence:update", handlePresence);
    socket.on("cursor:update", handleCursor);
    socket.on("card:editing", handleEditing);
    socket.on("board:error", handleBoardError);

    if (socket.connected) {
      join();
    } else {
      socket.connect();
    }

    // cleanup on unmounting or re-execution
    return () => {
      if (socket.connected) {
        socket.emit("board:leave");
      }

      socket.off("connect", join);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("board:state", handleState);
      socket.off("board:event", handleEvent);
      socket.off("presence:update", handlePresence);
      socket.off("cursor:update", handleCursor);
      socket.off("card:editing", handleEditing);
      socket.off("board:error", handleBoardError);
      setPresence([]);
      setCursors({});
      setEditingCards({});
      setRole(null);
    };
  }, [boardId, client]);

  return { status, error, role, presence, cursors, editingCards };
}

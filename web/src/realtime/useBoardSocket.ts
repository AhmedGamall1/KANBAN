import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { patchBoard } from "@/boards/useBoard";
import { socket, type BoardState } from "@/realtime/socket";

export type SocketStatus = "connecting" | "live" | "offline";

export function useBoardSocket(boardId: string | undefined) {
  const client = useQueryClient();
  const [status, setStatus] = useState<SocketStatus>(
    socket.connected ? "live" : "connecting",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) {
      return;
    }

    function join() {
      setStatus("live");
      setError(null);
      socket.emit("board:join", { boardId: boardId as string });
    }

    function handleDisconnect() {
      setStatus("offline");
    }

    function handleConnectError() {
      setStatus("offline");
      setError("Cannot reach the live connection.");
    }

    function handleState(state: BoardState) {
      patchBoard(client, state.boardId, (data) => ({ ...data, seq: state.seq }));
    }

    function handleBoardError(payload: { message: string }) {
      setError(payload.message);
    }

    socket.on("connect", join);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("board:state", handleState);
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
      socket.off("board:error", handleBoardError);
    };
  }, [boardId, client]);

  return { status, error };
}

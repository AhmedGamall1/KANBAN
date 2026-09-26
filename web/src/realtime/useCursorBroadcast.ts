import { useEffect, useRef, type RefObject } from "react";
import { socket } from "@/realtime/socket";

const CURSOR_INTERVAL = 50;

export function useCursorBroadcast(
  surface: RefObject<HTMLDivElement | null>,
) {
  const lastSentAt = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    },
    [],
  );

  function flush() {
    timer.current = null;

    if (!pending.current) {
      return;
    }

    socket.emit("cursor:move", pending.current);
    pending.current = null;
    lastSentAt.current = Date.now();
  }

  function track(event: { clientX: number; clientY: number }) {
    const box = surface.current?.getBoundingClientRect();

    if (!box || box.width === 0 || box.height === 0) {
      return;
    }

    pending.current = {
      x: Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)),
      y: Math.min(1, Math.max(0, (event.clientY - box.top) / box.height)),
    };

    const wait = CURSOR_INTERVAL - (Date.now() - lastSentAt.current);

    if (wait <= 0) {
      flush();
    } else if (timer.current === null) {
      timer.current = window.setTimeout(flush, wait);
    }
  }

  return track;
}

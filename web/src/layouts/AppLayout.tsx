import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "@/components/Sidebar";
import { SidebarIcon } from "@/components/ui/icons";

const STORAGE_KEY = "sidebar";

function readOpen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "closed";
  } catch {
    return true;
  }
}

export default function AppLayout() {
  const [open, setOpen] = useState(readOpen);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, open ? "open" : "closed");
    } catch {
      return;
    }
  }, [open]);

  return (
    <div className="flex h-screen">
      {open ? (
        <Sidebar onCollapse={() => setOpen(false)} />
      ) : (
        <div className="flex w-11 shrink-0 flex-col items-center border-r border-line bg-surface py-3">
          <button
            type="button"
            aria-label="Show sidebar"
            title="Show sidebar"
            onClick={() => setOpen(true)}
            className="rounded-control p-1.5 text-ink-faint transition-colors hover:bg-subtle hover:text-ink"
          >
            <SidebarIcon />
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

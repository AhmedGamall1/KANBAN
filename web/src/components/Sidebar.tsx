import { NavLink, useParams } from "react-router";
import Avatar from "@/components/ui/Avatar";
import { boards, currentUser, workspaces } from "@/data/fixtures";

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-ink-faint"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 6.5 8 10l3.5-3.5" />
    </svg>
  );
}

function BoardIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="3.5" height="10" rx="1" />
      <rect x="6.25" y="3" width="3.5" height="7" rx="1" />
      <rect x="10.5" y="3" width="3.5" height="4.5" rx="1" />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.75 13.25a4.25 4.25 0 0 1 8.5 0" />
      <path d="M10.5 3.2a2.5 2.5 0 0 1 0 4.6M11.5 9.4a4.25 4.25 0 0 1 2.75 3.85" />
    </svg>
  );
}

function navLinkClasses({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-2 rounded-control px-2 py-1.5 transition-colors",
    isActive
      ? "bg-brand-soft font-medium text-brand"
      : "text-ink-muted hover:bg-subtle hover:text-ink",
  ].join(" ");
}

export default function Sidebar() {
  const { workspaceId, boardId } = useParams();
  const activeBoard = boards.find((board) => board.id === boardId);
  const activeId = workspaceId ?? activeBoard?.workspaceId;
  const workspace =
    workspaces.find((item) => item.id === activeId) ?? workspaces[0];
  const workspaceBoards = boards.filter(
    (board) => board.workspaceId === workspace.id,
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface">
      <button
        type="button"
        className="flex items-center gap-2 border-b border-line p-3 text-left transition-colors hover:bg-subtle"
      >
        <Avatar name={workspace.name} size="lg" shape="square" />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {workspace.name}
          </span>
          <span className="block text-xs capitalize text-ink-muted">
            {workspace.role}
          </span>
        </span>
        <ChevronDownIcon />
      </button>

      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-1.5 text-xs font-medium text-ink-faint">Boards</p>
        <ul className="flex flex-col gap-0.5">
          {workspaceBoards.map((board) => (
            <li key={board.id}>
              <NavLink to={`/boards/${board.id}`} className={navLinkClasses}>
                <BoardIcon />
                <span className="truncate">{board.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="px-2 pt-5 pb-1.5 text-xs font-medium text-ink-faint">
          Workspace
        </p>
        <NavLink
          to={`/workspaces/${workspace.id}/members`}
          className={navLinkClasses}
        >
          <MembersIcon />
          <span className="truncate">Members</span>
        </NavLink>
      </nav>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <Avatar name={currentUser.name} color={currentUser.avatarColor} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {currentUser.name}
          </span>
          <span className="block truncate text-xs text-ink-muted">
            {currentUser.email}
          </span>
        </span>
      </div>
    </aside>
  );
}

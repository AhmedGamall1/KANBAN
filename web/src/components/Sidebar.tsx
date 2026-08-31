import { NavLink, useParams } from "react-router";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import Avatar from "@/components/ui/Avatar";
import { BoardIcon, MembersIcon } from "@/components/ui/icons";
import { boards, currentUser, workspaces } from "@/data/fixtures";



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
      <WorkspaceSwitcher workspace={workspace} />

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

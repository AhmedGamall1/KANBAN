import { NavLink, useNavigate, useParams } from "react-router";
import { useAuth, useLogout } from "@/auth/useAuth";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import Avatar from "@/components/ui/Avatar";
import { BoardIcon, LogOutIcon, MembersIcon } from "@/components/ui/icons";
import { boards } from "@/data/fixtures";
import { useWorkspace } from "@/workspaces/useWorkspaces";



function navLinkClasses({ isActive }: { isActive: boolean }): string {
  return [
    "flex items-center gap-2 rounded-control px-2 py-1.5 transition-colors",
    isActive
      ? "bg-brand-soft font-medium text-brand"
      : "text-ink-muted hover:bg-subtle hover:text-ink",
  ].join(" ");
}

export default function Sidebar() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { workspaceId, boardId } = useParams();
  const activeBoard = boards.find((board) => board.id === boardId);
  const { workspace } = useWorkspace(workspaceId ?? activeBoard?.workspaceId);
  const workspaceBoards = boards.filter(
    (board) => board.workspaceId === activeBoard?.workspaceId,
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
        {workspace && (
          <NavLink
            to={`/workspaces/${workspace.id}/members`}
            className={navLinkClasses}
          >
            <MembersIcon />
            <span className="truncate">Members</span>
          </NavLink>
        )}
      </nav>

      {user && (
        <div className="flex items-center gap-2 border-t border-line p-3">
          <Avatar name={user.name} color={user.avatarColor} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-ink">
              {user.name}
            </span>
            <span className="block truncate text-xs text-ink-muted">
              {user.email}
            </span>
          </span>

          <button
            type="button"
            aria-label="Log out"
            title="Log out"
            disabled={logout.isPending}
            onClick={() =>
              logout.mutate(undefined, {
                onSuccess: () => navigate("/login", { replace: true }),
              })
            }
            className="rounded-control p-1.5 text-ink-faint transition-colors hover:bg-subtle hover:text-ink disabled:opacity-60"
          >
            <LogOutIcon />
          </button>
        </div>
      )}
    </aside>
  );
}

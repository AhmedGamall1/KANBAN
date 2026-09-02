import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "@/auth/useAuth";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { inviteLinks } from "@/data/fixtures";
import { useMembers } from "@/workspaces/useMembers";
import { useWorkspace, type Role } from "@/workspaces/useWorkspaces";

const ROLES: Role[] = ["owner", "member", "viewer"];

function InviteLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  function copy() {
    navigator.clipboard.writeText(link).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }

  return (
    <section className="mt-6 rounded-card border border-line bg-surface p-4">
      <h2 className="font-medium text-ink">Invite link</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Anyone with this link joins as a member. The link does not expire.
      </p>

      <div className="mt-3 flex gap-2">
        <input
          readOnly
          value={link}
          aria-label="Invite link"
          onFocus={(event) => event.currentTarget.select()}
          className="h-9 min-w-0 flex-1 rounded-control border border-line bg-subtle px-2.5 text-ink-muted"
        />
        <Button variant="secondary" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </section>
  );
}

export default function MembersPage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { workspace, isPending: workspacePending } = useWorkspace(workspaceId);
  const {
    data: members,
    isPending: membersPending,
    error,
  } = useMembers(workspaceId);

  if (workspacePending || membersPending) {
    return <Spinner />;
  }

  if (!workspace) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="font-medium text-ink">Workspace not found</p>
        <p className="mt-1 text-ink-muted">
          It may have been deleted, or you are no longer a member of it.
        </p>
      </div>
    );
  }

  const isOwner = workspace.role === "owner";

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <PageHeader
        title="Members"
        description={`People with access to ${workspace.name}.`}
      />

      {isOwner && inviteLinks[workspace.id] && (
        <InviteLink link={inviteLinks[workspace.id]} />
      )}

      {error ? (
        <div className="mt-6 rounded-card border border-line bg-surface px-6 py-12 text-center">
          <p className="font-medium text-ink">Could not load members</p>
          <p className="mt-1 text-ink-muted">{error.message}</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line border-t border-line">
          {members.map((member) => {
            const isSelf = member.userId === user?.id;

            return (
              <li key={member.userId} className="flex items-center gap-3 py-3">
                <Avatar
                  name={member.name}
                  color={member.avatarColor}
                  size="lg"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">
                    {member.name}
                    {isSelf && <span className="text-ink-faint"> (you)</span>}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {member.email}
                  </p>
                </div>

                {isOwner && !isSelf ? (
                  <div className="flex items-center gap-2">
                    <Select
                      label={`Role for ${member.name}`}
                      labelHidden
                      defaultValue={member.role}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                    <Button variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm capitalize text-ink-muted">
                    {member.role}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

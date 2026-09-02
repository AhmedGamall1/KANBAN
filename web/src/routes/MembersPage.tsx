import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "@/auth/useAuth";
import PageHeader from "@/components/PageHeader";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Select from "@/components/ui/Select";
import Spinner from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api";
import { inviteUrl, useInviteLink } from "@/workspaces/useInvite";
import {
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
  type Member,
} from "@/workspaces/useMembers";
import { useWorkspace, type Role } from "@/workspaces/useWorkspaces";

const ROLES: Role[] = ["owner", "member", "viewer"];

function InviteLink({ workspaceId }: { workspaceId: string }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = useInviteLink(workspaceId);
  const link = inviteLink.data ? inviteUrl(inviteLink.data.token) : null;

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timer = setTimeout(() => setCopied(false), 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  function copy(value: string) {
    navigator.clipboard.writeText(value).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }

  return (
    <section className="mt-6 rounded-card border border-line bg-surface p-4">
      <h2 className="font-medium text-ink">Invite link</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Anyone with this link joins as a member. The link does not expire, and
        every owner sees the same one.
      </p>

      {link ? (
        <div className="mt-3 flex gap-2">
          <input
            readOnly
            value={link}
            aria-label="Invite link"
            onFocus={(event) => event.currentTarget.select()}
            className="h-9 min-w-0 flex-1 rounded-control border border-line bg-subtle px-2.5 text-ink-muted"
          />
          <Button variant="secondary" onClick={() => copy(link)}>
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="mt-3"
          disabled={inviteLink.isPending}
          onClick={() => inviteLink.mutate()}
        >
          {inviteLink.isPending ? "Loading…" : "Show invite link"}
        </Button>
      )}

      {inviteLink.error instanceof ApiError && (
        <p className="mt-3 rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
          {inviteLink.error.message}
        </p>
      )}
    </section>
  );
}

export default function MembersPage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const [removing, setRemoving] = useState<Member | null>(null);
  const { workspace, isPending: workspacePending } = useWorkspace(workspaceId);
  const {
    data: members,
    isPending: membersPending,
    error,
  } = useMembers(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId ?? "");
  const removeMember = useRemoveMember(workspaceId ?? "");

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

      {isOwner && <InviteLink workspaceId={workspace.id} />}

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
                      value={member.role}
                      disabled={updateRole.isPending}
                      onChange={(event) =>
                        updateRole.mutate({
                          userId: member.userId,
                          role: event.target.value as Role,
                        })
                      }
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="danger-ghost"
                      size="sm"
                      onClick={() => {
                        removeMember.reset();
                        setRemoving(member);
                      }}
                    >
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

      {updateRole.error instanceof ApiError && (
        <p className="mt-4 rounded-control bg-danger-soft px-2.5 py-2 text-sm text-danger">
          {updateRole.error.message}
        </p>
      )}

      {removing && (
        <ConfirmDialog
          title="Remove member"
          body={`${removing.name} will lose access to ${workspace.name} and every board in it.`}
          confirmLabel="Remove member"
          pending={removeMember.isPending}
          error={
            removeMember.error instanceof ApiError
              ? removeMember.error.message
              : undefined
          }
          onClose={() => setRemoving(null)}
          onConfirm={() =>
            removeMember.mutate(removing.userId, {
              onSuccess: () => setRemoving(null),
            })
          }
        />
      )}
    </div>
  );
}

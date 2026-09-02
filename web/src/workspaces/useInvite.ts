import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  workspacesQueryKey,
  type Role,
  type Workspace,
} from "@/workspaces/useWorkspaces";

export interface Invite {
  id: string;
  workspaceId: string;
  token: string;
  createdAt: string;
}

interface AcceptedInvite {
  workspace: Omit<Workspace, "role">;
  role: Role;
}

export function inviteUrl(token: string): string {
  return new URL(`/invite/${token}`, window.location.origin).toString();
}

export function useInviteLink(workspaceId: string) {
  return useMutation({
    mutationFn: async () => {
      const { invite } = await api.post<{ invite: Invite }>(
        `/workspaces/${workspaceId}/invite-link`,
      );

      return invite;
    },
  });
}

export function useAcceptInvite() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (token: string) =>
      api.post<AcceptedInvite>(`/invites/${token}/accept`),
    onSuccess: ({ workspace, role }) => {
      const joined: Workspace = { ...workspace, role };

      client.setQueryData<Workspace[]>(workspacesQueryKey, (current) => {
        if (!current) {
          return [joined];
        }

        if (current.some((item) => item.id === joined.id)) {
          return current.map((item) =>
            item.id === joined.id ? joined : item,
          );
        }

        return [...current, joined].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
      });

      void client.invalidateQueries({ queryKey: workspacesQueryKey });
    },
  });
}

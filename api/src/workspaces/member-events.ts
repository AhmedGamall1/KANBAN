import type { Role } from '../access/access.repository';

export const MEMBER_REMOVED = 'member.removed';
export const MEMBER_ROLE_CHANGED = 'member.role-changed';

export interface MemberRemovedEvent {
    workspaceId: string;
    userId: string;
}

export interface MemberRoleChangedEvent {
    workspaceId: string;
    userId: string;
    role: Role;
}

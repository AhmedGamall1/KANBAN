import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { InvitesRepository, type Invite } from './invites.repository';
import { MembersRepository, type Role } from './members.repository';
import {
    WorkspacesRepository,
    type Workspace,
} from './workspaces.repository';
import { AccessRepository } from '../access/access.repository';

@Injectable()
export class InvitesService {
    constructor(
        private readonly invites: InvitesRepository,
        private readonly workspaces: WorkspacesRepository,
        private readonly members: MembersRepository,
        private readonly access: AccessRepository,
    ) { }

    async generateLink(workspaceId: string, userId: string): Promise<Invite> {
        const existing = await this.invites.findByWorkspace(workspaceId);

        if (existing) {
            return existing;
        }

        return this.invites.create({
            workspaceId,
            createdBy: userId,
            token: randomBytes(32).toString('base64url'),
        });
    }

    async accept(
        token: string,
        userId: string,
    ): Promise<{ workspace: Workspace; role: Role }> {
        const workspaceId = await this.invites.findWorkspaceIdByToken(token);

        if (!workspaceId) {
            throw new NotFoundException('Invite not found');
        }

        await this.members.addIfAbsent({ workspaceId, userId, role: 'member' });

        const workspace = await this.workspaces.findById(workspaceId);
        const role = await this.access.roleFor('workspace', workspaceId, userId);

        if (!workspace || !role) {
            throw new NotFoundException('Workspace not found');
        }

        return { workspace, role };
    }
}
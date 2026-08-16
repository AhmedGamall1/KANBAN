import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { InvitesRepository, type Invite } from './invites.repository';
import { MembersRepository, type Role } from './members.repository';
import {
    WorkspacesRepository,
    type Workspace,
} from './workspaces.repository';

@Injectable()
export class InvitesService {
    constructor(
        private readonly db: DatabaseService,
        private readonly invites: InvitesRepository,
        private readonly workspaces: WorkspacesRepository,
        private readonly members: MembersRepository,
    ) { }

    async generateLink(workspaceId: string, userId: string): Promise<Invite> {
        return this.db.transaction(async (tx) => {
            await this.workspaces.lockForUpdate(workspaceId, tx);

            const existing = await this.invites.findByWorkspace(workspaceId, tx);

            if (existing) {
                return existing;
            }

            return this.invites.create(
                {
                    workspaceId,
                    createdBy: userId,
                    token: randomBytes(32).toString('base64url'),
                },
                tx,
            );
        });
    }

    async accept(
        token: string,
        userId: string,
    ): Promise<{ workspace: Workspace; role: Role }> {
        const invite = await this.invites.findByToken(token);

        if (!invite) {
            throw new NotFoundException('Invite not found');
        }

        await this.members.addIfAbsent({
            workspaceId: invite.workspaceId,
            userId,
            role: 'member',
        });

        const workspace = await this.workspaces.findById(invite.workspaceId);
        const role = await this.members.findRole(invite.workspaceId, userId);

        if (!workspace || !role) {
            throw new NotFoundException('Workspace not found');
        }

        return { workspace, role };
    }
}
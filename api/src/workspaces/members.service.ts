import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';
import { MembersRepository, type Member, type Role } from './members.repository';
import { WorkspacesRepository } from './workspaces.repository';

@Injectable()
export class MembersService {
    constructor(
        private readonly db: DatabaseService,
        private readonly workspaces: WorkspacesRepository,
        private readonly members: MembersRepository,
    ) { }

    list(workspaceId: string): Promise<Member[]> {
        return this.members.list(workspaceId);
    }

    async remove(workspaceId: string, userId: string): Promise<void> {
        await this.db.transaction(async (tx) => {
            await this.workspaces.lockForUpdate(workspaceId, tx);
            await this.assertNotLastOwner(workspaceId, userId, tx);

            const removed = await this.members.remove(workspaceId, userId, tx);

            if (!removed) {
                throw new NotFoundException('Member not found');
            }
        });
    }

    async updateRole(
        workspaceId: string,
        userId: string,
        role: Role,
    ): Promise<Member> {
        return this.db.transaction(async (tx) => {
            await this.workspaces.lockForUpdate(workspaceId, tx);

            if (role !== 'owner') {
                await this.assertNotLastOwner(workspaceId, userId, tx);
            }

            const member = await this.members.updateRole(workspaceId, userId, role, tx);

            if (!member) {
                throw new NotFoundException('Member not found');
            }

            return member;
        });
    }

    private async assertNotLastOwner(
        workspaceId: string,
        userId: string,
        tx: Queryable,
    ): Promise<void> {
        const role = await this.members.findRole(workspaceId, userId, tx);

        if (role !== 'owner') {
            return;
        }

        if ((await this.members.countOwners(workspaceId, tx)) <= 1) {
            throw new ConflictException(
                'A workspace must always have at least one owner',
            );
        }
    }
}
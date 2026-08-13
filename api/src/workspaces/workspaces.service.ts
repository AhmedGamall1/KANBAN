import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { MembersRepository } from './members.repository';
import {
    WorkspacesRepository,
    type WorkspaceWithRole,
} from './workspaces.repository';

@Injectable()
export class WorkspacesService {
    constructor(
        private readonly db: DatabaseService,
        private readonly workspaces: WorkspacesRepository,
        private readonly members: MembersRepository,
    ) { }

    async create(
        userId: string,
        dto: CreateWorkspaceDto,
    ): Promise<WorkspaceWithRole> {
        return this.db.transaction(async (tx) => {
            const workspace = await this.workspaces.create(dto.name, tx);

            await this.members.add(
                { workspaceId: workspace.id, userId, role: 'owner' },
                tx,
            );

            return { ...workspace, role: 'owner' };
        });
    }

    listForUser(userId: string): Promise<WorkspaceWithRole[]> {
        return this.workspaces.listForUser(userId);
    }
}
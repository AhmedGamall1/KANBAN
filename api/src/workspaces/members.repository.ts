import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export type Role = 'owner' | 'member' | 'viewer';

@Injectable()
export class MembersRepository {
    constructor(private readonly db: DatabaseService) { }

    async add(
        input: { workspaceId: string; userId: string; role: Role },
        tx?: Queryable,
    ): Promise<void> {
        await (tx ?? this.db).query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)`,
            [input.workspaceId, input.userId, input.role],
        );
    }
}
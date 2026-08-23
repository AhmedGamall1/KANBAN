import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export type Role = 'owner' | 'member' | 'viewer';
export type AccessScope = 'workspace' | 'board' | 'column' | 'card';

const ROLE_FUNCTIONS: Record<AccessScope, string> = {
    workspace: 'app_member_role',
    board: 'app_board_role',
    column: 'app_column_role',
    card: 'app_card_role',
};

@Injectable()
export class AccessRepository {
    constructor(private readonly db: DatabaseService) { }

    async roleFor(
        scope: AccessScope,
        id: string,
        userId: string,
        tx?: Queryable,
    ): Promise<Role | null> {
        const { rows } = await (tx ?? this.db).query<{ role: Role | null }>(
            `SELECT ${ROLE_FUNCTIONS[scope]}($1, $2) AS role`,
            [id, userId],
        );

        return rows[0]?.role ?? null;
    }
}
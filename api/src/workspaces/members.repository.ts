import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export type Role = 'owner' | 'member' | 'viewer';

export interface Member {
    userId: string;
    name: string;
    email: string;
    avatarColor: string;
    role: Role;
    joinedAt: Date;
}

interface MemberRow {
    user_id: string;
    name: string;
    email: string;
    avatar_color: string;
    role: Role;
    joined_at: Date;
}

function toMember(row: MemberRow): Member {
    return {
        userId: row.user_id,
        name: row.name,
        email: row.email,
        avatarColor: row.avatar_color,
        role: row.role,
        joinedAt: row.joined_at,
    };
}

const MEMBER_COLUMNS = `
  m.user_id, u.name, u.email, u.avatar_color, m.role, m.joined_at
`;

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

    async findRole(
        workspaceId: string,
        userId: string,
        tx?: Queryable,
    ): Promise<Role | null> {
        const { rows } = await (tx ?? this.db).query<{ role: Role | null }>(
            `SELECT app_member_role($1, $2) AS role`,
            [workspaceId, userId],
        );

        return rows[0]?.role ?? null;
    }

    async list(workspaceId: string): Promise<Member[]> {
        const { rows } = await this.db.query<MemberRow>(
            `SELECT ${MEMBER_COLUMNS}
         FROM workspace_members m
         JOIN users u ON u.id = m.user_id
        WHERE m.workspace_id = $1
        ORDER BY m.joined_at`,
            [workspaceId],
        );

        return rows.map(toMember);
    }

    async countOwners(workspaceId: string, tx?: Queryable): Promise<number> {
        const { rows } = await (tx ?? this.db).query<{ count: string }>(
            `SELECT count(*)::text AS count
         FROM workspace_members
        WHERE workspace_id = $1 AND role = 'owner'`,
            [workspaceId],
        );

        return Number(rows[0].count);
    }

    async remove(
        workspaceId: string,
        userId: string,
        tx?: Queryable,
    ): Promise<boolean> {
        const { rowCount } = await (tx ?? this.db).query(
            `DELETE FROM workspace_members
        WHERE workspace_id = $1 AND user_id = $2`,
            [workspaceId, userId],
        );



        return (rowCount ?? 0) > 0;
    }

    async updateRole(
        workspaceId: string,
        userId: string,
        role: Role,
        tx?: Queryable,
    ): Promise<Member | null> {
        const { rows } = await (tx ?? this.db).query<MemberRow>(
            `UPDATE workspace_members m
          SET role = $3
         FROM users u
        WHERE m.workspace_id = $1 AND m.user_id = $2 AND u.id = m.user_id
    RETURNING ${MEMBER_COLUMNS}`,
            [workspaceId, userId, role],
        );

        return rows[0] ? toMember(rows[0]) : null;
    }


    async addIfAbsent(
        input: { workspaceId: string; userId: string; role: Role },
        tx?: Queryable,
    ): Promise<void> {
        await (tx ?? this.db).query(
            `INSERT INTO workspace_members (workspace_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (workspace_id, user_id) DO NOTHING`,
            [input.workspaceId, input.userId, input.role],
        );
    }
}
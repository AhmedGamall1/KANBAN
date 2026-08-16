import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export interface Invite {
    id: string;
    workspaceId: string;
    token: string;
    createdAt: Date;
}

interface InviteRow {
    id: string;
    workspace_id: string;
    token: string;
    created_by: string;
    created_at: Date;
}

function toInvite(row: InviteRow): Invite {
    return {
        id: row.id,
        workspaceId: row.workspace_id,
        token: row.token,
        createdAt: row.created_at,
    };
}

@Injectable()
export class InvitesRepository {
    constructor(private readonly db: DatabaseService) { }

    async findByWorkspace(
        workspaceId: string,
        tx?: Queryable,
    ): Promise<Invite | null> {
        const { rows } = await (tx ?? this.db).query<InviteRow>(
            `SELECT * FROM invites WHERE workspace_id = $1 ORDER BY created_at LIMIT 1`,
            [workspaceId],
        );

        return rows[0] ? toInvite(rows[0]) : null;
    }

    async findByToken(token: string): Promise<Invite | null> {
        const { rows } = await this.db.query<InviteRow>(
            `SELECT * FROM invites WHERE token = $1`,
            [token],
        );

        return rows[0] ? toInvite(rows[0]) : null;
    }

    async create(
        input: { workspaceId: string; createdBy: string; token: string },
        tx?: Queryable,
    ): Promise<Invite> {
        const { rows } = await (tx ?? this.db).query<InviteRow>(
            `INSERT INTO invites (workspace_id, created_by, token)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [input.workspaceId, input.createdBy, input.token],
        );

        return toInvite(rows[0]);
    }
}
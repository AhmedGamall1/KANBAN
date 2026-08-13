import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';
import type { Role } from './members.repository';

export interface Workspace {
    id: string;
    name: string;
    createdAt: Date;
}

export interface WorkspaceWithRole extends Workspace {
    role: Role;
}

interface WorkspaceRow {
    id: string;
    name: string;
    created_at: Date;
}

function toWorkspace(row: WorkspaceRow): Workspace {
    return { id: row.id, name: row.name, createdAt: row.created_at };
}

@Injectable()
export class WorkspacesRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(name: string, tx?: Queryable): Promise<Workspace> {
        const { rows } = await (tx ?? this.db).query<WorkspaceRow>(
            `INSERT INTO workspaces (name) VALUES ($1) RETURNING *`,
            [name],
        );

        return toWorkspace(rows[0]);
    }

    async listForUser(userId: string): Promise<WorkspaceWithRole[]> {
        const { rows } = await this.db.query<WorkspaceRow & { role: Role }>(
            `SELECT w.*, m.role
         FROM workspaces w
         JOIN workspace_members m ON m.workspace_id = w.id
        WHERE m.user_id = $1
        ORDER BY w.created_at`,
            [userId],
        );

        return rows.map((row) => ({ ...toWorkspace(row), role: row.role }));
    }
}
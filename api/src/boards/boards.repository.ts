import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export interface Board {
    id: string;
    workspaceId: string;
    name: string;
    createdAt: Date;
}

interface BoardRow {
    id: string;
    workspace_id: string;
    name: string;
    created_at: Date;
}

function toBoard(row: BoardRow): Board {
    return {
        id: row.id,
        workspaceId: row.workspace_id,
        name: row.name,
        createdAt: row.created_at,
    };
}

@Injectable()
export class BoardsRepository {
    constructor(private readonly db: DatabaseService) { }

    async listByWorkspace(workspaceId: string): Promise<Board[]> {
        const { rows } = await this.db.query<BoardRow>(
            `SELECT * FROM boards WHERE workspace_id = $1 ORDER BY created_at`,
            [workspaceId],
        );

        return rows.map(toBoard);
    }

    async create(
        input: { workspaceId: string; name: string },
        tx?: Queryable,
    ): Promise<Board> {
        const { rows } = await (tx ?? this.db).query<BoardRow>(
            `INSERT INTO boards (workspace_id, name)
       VALUES ($1, $2)
       RETURNING *`,
            [input.workspaceId, input.name],
        );

        return toBoard(rows[0]);
    }
}
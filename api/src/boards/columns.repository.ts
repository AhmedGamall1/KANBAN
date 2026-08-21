import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export interface Column {
    id: string;
    boardId: string;
    name: string;
    position: number;
}

interface ColumnRow {
    id: string;
    workspace_id: string;
    board_id: string;
    name: string;
    position: number;
}

function toColumn(row: ColumnRow): Column {
    return {
        id: row.id,
        boardId: row.board_id,
        name: row.name,
        position: row.position,
    };
}

@Injectable()
export class ColumnsRepository {
    constructor(private readonly db: DatabaseService) { }

    async listByBoard(boardId: string, tx?: Queryable): Promise<Column[]> {
        const { rows } = await (tx ?? this.db).query<ColumnRow>(
            `SELECT * FROM columns WHERE board_id = $1 ORDER BY position`,
            [boardId],
        );

        return rows.map(toColumn);
    }

    async nextPosition(boardId: string, tx?: Queryable): Promise<number> {
        const { rows } = await (tx ?? this.db).query<{ next: number }>(
            `SELECT coalesce(max(position), 0) + 1 AS next
         FROM columns WHERE board_id = $1`,
            [boardId],
        );

        return rows[0].next;
    }

    async create(
        input: { boardId: string; name: string; position: number },
        tx?: Queryable,
    ): Promise<Column> {
        const { rows } = await (tx ?? this.db).query<ColumnRow>(
            `INSERT INTO columns (workspace_id, board_id, name, position)
       SELECT b.workspace_id, b.id, $2, $3
         FROM boards b
        WHERE b.id = $1
       RETURNING *`,
            [input.boardId, input.name, input.position],
        );

        return toColumn(rows[0]);
    }
}
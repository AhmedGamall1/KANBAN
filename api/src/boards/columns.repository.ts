import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';
import type { Role } from '../workspaces/members.repository';

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

    async findRole(columnId: string, userId: string): Promise<Role | null> {
        const { rows } = await this.db.query<{ role: Role | null }>(
            `SELECT app_column_role($1, $2) AS role`,
            [columnId, userId],
        );

        return rows[0]?.role ?? null;
    }

    async findById(id: string, tx?: Queryable): Promise<Column | null> {
        const { rows } = await (tx ?? this.db).query<ColumnRow>(
            `SELECT * FROM columns WHERE id = $1`,
            [id],
        );

        return rows[0] ? toColumn(rows[0]) : null;
    }

    async rename(id: string, name: string, tx?: Queryable): Promise<void> {
        await (tx ?? this.db).query(
            `UPDATE columns SET name = $2 WHERE id = $1`,
            [id, name],
        );
    }

    async setPosition(id: string, position: number, tx?: Queryable): Promise<void> {
        await (tx ?? this.db).query(
            `UPDATE columns SET position = $2 WHERE id = $1`,
            [id, position],
        );
    }

    async shiftForMove(
        boardId: string,
        from: number,
        to: number,
        tx: Queryable,
    ): Promise<number> {
        const { rowCount } =
            to < from
                ? await tx.query(
                    `UPDATE columns SET position = position + 1
              WHERE board_id = $1 AND position >= $2 AND position < $3`,
                    [boardId, to, from],
                )
                : await tx.query(
                    `UPDATE columns SET position = position - 1
              WHERE board_id = $1 AND position > $2 AND position <= $3`,
                    [boardId, from, to],
                );

        return rowCount ?? 0;
    }

    async remove(id: string): Promise<boolean> {
        const { rowCount } = await this.db.query(
            `DELETE FROM columns WHERE id = $1`,
            [id],
        );

        return (rowCount ?? 0) > 0;
    }
}
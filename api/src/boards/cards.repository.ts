import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';
import { Role } from 'src/workspaces/members.repository';

export type CardLabel = 'infra' | 'db' | 'frontend' | 'bug' | 'chore';

export interface Card {
    id: string;
    boardId: string;
    columnId: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    label: CardLabel | null;
    position: string;
    createdAt: Date;
}

interface CardRow {
    id: string;
    workspace_id: string;
    board_id: string;
    column_id: string;
    title: string;
    description: string | null;
    assignee_id: string | null;
    label: CardLabel | null;
    position: string;
    created_at: Date;
}

function toCard(row: CardRow): Card {
    return {
        id: row.id,
        boardId: row.board_id,
        columnId: row.column_id,
        title: row.title,
        description: row.description,
        assigneeId: row.assignee_id,
        label: row.label,
        position: row.position,
        createdAt: row.created_at,
    };
}

@Injectable()
export class CardsRepository {
    constructor(private readonly db: DatabaseService) { }

    async listByBoard(boardId: string, tx?: Queryable): Promise<Card[]> {
        const { rows } = await (tx ?? this.db).query<CardRow>(
            `SELECT * FROM cards WHERE board_id = $1 ORDER BY column_id, position`,
            [boardId],
        );

        return rows.map(toCard);
    }

    async nextPosition(columnId: string, tx?: Queryable): Promise<string> {
        const { rows } = await (tx ?? this.db).query<{ next: string }>(
            `SELECT coalesce(max(position), 0) + 1 AS next
         FROM cards WHERE column_id = $1`,
            [columnId],
        );

        return rows[0].next;
    }

    async create(
        input: {
            boardId: string;
            columnId: string;
            title: string;
            position: string;
        },
        tx?: Queryable,
    ): Promise<Card | null> {
        const { rows } = await (tx ?? this.db).query<CardRow>(
            `INSERT INTO cards (workspace_id, board_id, column_id, title, position)
       SELECT co.workspace_id, co.board_id, co.id, $3, $4
         FROM columns co
        WHERE co.id = $2 AND co.board_id = $1
       RETURNING *`,
            [input.boardId, input.columnId, input.title, input.position],
        );

        return rows[0] ? toCard(rows[0]) : null;
    }


    async findRole(cardId: string, userId: string): Promise<Role | null> {
        const { rows } = await this.db.query<{ role: Role | null }>(
            `SELECT app_card_role($1, $2) AS role`,
            [cardId, userId],
        );

        return rows[0]?.role ?? null;
    }

    async findById(id: string, tx?: Queryable): Promise<Card | null> {
        const { rows } = await (tx ?? this.db).query<CardRow>(
            `SELECT * FROM cards WHERE id = $1`,
            [id],
        );

        return rows[0] ? toCard(rows[0]) : null;
    }

    async update(
        id: string,
        patch: {
            title?: string;
            description?: string | null;
            assigneeId?: string | null;
            label?: CardLabel | null;
        },
        tx?: Queryable,
    ): Promise<Card | null> {
        const sets: string[] = [];
        const values: unknown[] = [id];

        const push = (column: string, value: unknown): void => {
            values.push(value);
            sets.push(`${column} = $${values.length}`);
        };

        if (patch.title !== undefined) push('title', patch.title);
        if (patch.description !== undefined) push('description', patch.description);
        if (patch.assigneeId !== undefined) push('assignee_id', patch.assigneeId);
        if (patch.label !== undefined) push('label', patch.label);

        if (sets.length === 0) {
            return this.findById(id, tx);
        }

        const { rows } = await (tx ?? this.db).query<CardRow>(
            `UPDATE cards SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
            values,
        );

        return rows[0] ? toCard(rows[0]) : null;
    }

    async remove(id: string): Promise<boolean> {
        const { rowCount } = await this.db.query(
            `DELETE FROM cards WHERE id = $1`,
            [id],
        );

        return (rowCount ?? 0) > 0;
    }

    async place(
        cardId: string,
        columnId: string,
        position: string,
        tx: Queryable,
    ): Promise<Card | null> {
        const { rows } = await tx.query<CardRow>(
            `UPDATE cards c
          SET column_id = co.id, position = $3::numeric
         FROM columns co
        WHERE c.id = $1 AND co.id = $2 AND co.board_id = c.board_id
      RETURNING c.*`,
            [cardId, columnId, position],
        );

        return rows[0] ? toCard(rows[0]) : null;
    }
}
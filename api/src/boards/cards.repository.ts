import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export type CardLabel = 'infra' | 'db' | 'frontend' | 'bug' | 'chore';

export interface Card {
    id: string;
    boardId: string;
    columnId: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    label: CardLabel | null;
    position: number;
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
    position: number;
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

    async nextPosition(columnId: string, tx?: Queryable): Promise<number> {
        const { rows } = await (tx ?? this.db).query<{ next: number }>(
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
            position: number;
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
}
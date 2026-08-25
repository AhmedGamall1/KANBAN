import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export type EventType =
    | 'card_created'
    | 'card_updated'
    | 'card_moved'
    | 'card_deleted'
    | 'column_created'
    | 'column_renamed'
    | 'column_moved'
    | 'column_deleted'
    | 'board_created'
    | 'board_renamed';

export interface BoardEvent {
    seq: string;
    boardId: string;
    actorId: string;
    type: EventType;
    payload: Record<string, unknown>;
    createdAt: Date;
}

interface BoardEventRow {
    seq: string;
    workspace_id: string;
    board_id: string;
    actor_id: string;
    type: EventType;
    payload: Record<string, unknown>;
    created_at: Date;
}

function toEvent(row: BoardEventRow): BoardEvent {
    return {
        seq: row.seq,
        boardId: row.board_id,
        actorId: row.actor_id,
        type: row.type,
        payload: row.payload,
        createdAt: row.created_at,
    };
}

@Injectable()
export class EventsRepository {
    constructor(private readonly db: DatabaseService) { }

    async lockBoard(boardId: string, tx: Queryable): Promise<void> {
        await tx.query(`SELECT id FROM boards WHERE id = $1 FOR UPDATE`, [boardId]);
    }

    async append(
        input: {
            boardId: string;
            actorId: string;
            type: EventType;
            payload: Record<string, unknown>;
        },
        tx: Queryable,
    ): Promise<BoardEvent> {
        const { rows } = await tx.query<BoardEventRow>(
            `INSERT INTO board_events (workspace_id, board_id, actor_id, type, payload)
       SELECT b.workspace_id, b.id, $2, $3, $4::jsonb
         FROM boards b
        WHERE b.id = $1
       RETURNING *`,
            [input.boardId, input.actorId, input.type, JSON.stringify(input.payload)],
        );

        return toEvent(rows[0]);
    }

    async currentSeq(boardId: string, tx?: Queryable): Promise<string> {
        const { rows } = await (tx ?? this.db).query<{ seq: string }>(
            `SELECT coalesce(max(seq), 0)::text AS seq
         FROM board_events WHERE board_id = $1`,
            [boardId],
        );

        return rows[0].seq;
    }

    async listAfter(
        boardId: string,
        after: string,
        limit: number,
        tx?: Queryable,
    ): Promise<BoardEvent[]> {
        const { rows } = await (tx ?? this.db).query<BoardEventRow>(
            `SELECT * FROM board_events
        WHERE board_id = $1 AND seq > $2::bigint
        ORDER BY seq
        LIMIT $3`,
            [boardId, after, limit],
        );

        return rows.map(toEvent);
    }
}
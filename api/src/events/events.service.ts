import { Injectable } from '@nestjs/common';
import type { Queryable } from '../database/database.service';
import {
    ActivityEntry,
    EventsRepository,
    type BoardEvent,
    type EventType,
} from './events.repository';

const CATCH_UP_LIMIT = 500;
const ACTIVITY_LIMIT = 100;

@Injectable()
export class EventsService {
    constructor(private readonly events: EventsRepository) { }

    async since(
        boardId: string,
        after: string,
    ): Promise<{ events: BoardEvent[]; hasMore: boolean }> {
        const rows = await this.events.listAfter(boardId, after, CATCH_UP_LIMIT + 1);
        const hasMore = rows.length > CATCH_UP_LIMIT;

        return { events: hasMore ? rows.slice(0, CATCH_UP_LIMIT) : rows, hasMore };
    }

    currentSeq(boardId: string, tx?: Queryable): Promise<string> {
        return this.events.currentSeq(boardId, tx);
    }


    activityForCard(cardId: string): Promise<ActivityEntry[]> {
        return this.events.listForCard(cardId, ACTIVITY_LIMIT);
    }

    async record(
        input: {
            boardId: string;
            actorId: string;
            type: EventType;
            payload: Record<string, unknown>;
        },
        tx: Queryable,
    ): Promise<BoardEvent> {
        await this.events.lockBoard(input.boardId, tx);

        return this.events.append(input, tx);
    }

}
import { Injectable } from '@nestjs/common';
import type { Queryable } from '../database/database.service';
import {
    EventsRepository,
    type BoardEvent,
    type EventType,
} from './events.repository';

@Injectable()
export class EventsService {
    constructor(private readonly events: EventsRepository) { }

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
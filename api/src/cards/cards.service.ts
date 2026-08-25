import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CardsRepository, type Card } from './cards.repository';
import type { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { EventsService } from 'src/events/events.service';

function isForeignKeyViolation(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23503'
    );
}


@Injectable()
export class CardsService {
    private readonly logger = new Logger(CardsService.name);

    constructor(
        private readonly db: DatabaseService,
        private readonly cards: CardsRepository,
        private readonly events: EventsService
    ) { }

    create(boardId: string, actorId: string, dto: CreateCardDto): Promise<Card> {
        return this.db.transaction(async (tx) => {
            const position = await this.cards.nextPosition(dto.columnId, tx);

            const card = await this.cards.create(
                { boardId, columnId: dto.columnId, title: dto.title, position },
                tx,
            );

            if (!card) {
                throw new NotFoundException('Column not found on this board');
            }

            await this.events.record(
                { boardId, actorId, type: 'card_created', payload: { cardId: card.id, card } },
                tx,
            );

            return card;
        });
    }


    async update(
        cardId: string,
        actorId: string,
        dto: UpdateCardDto,
    ): Promise<Card> {
        return this.db.transaction(async (tx) => {
            let card: Card | null;

            try {
                card = await this.cards.update(cardId, dto, tx);
            } catch (error) {
                if (isForeignKeyViolation(error)) {
                    throw new BadRequestException(
                        'Assignee must be a member of this workspace',
                    );
                }
                throw error;
            }

            if (!card) {
                throw new NotFoundException('Card not found');
            }

            await this.events.record(
                {
                    boardId: card.boardId,
                    actorId,
                    type: 'card_updated',
                    payload: { cardId, changes: dto },
                },
                tx,
            );

            return card;
        });
    }

    async remove(cardId: string, actorId: string): Promise<void> {
        await this.db.transaction(async (tx) => {
            const card = await this.cards.findById(cardId, tx);

            if (!card) {
                throw new NotFoundException('Card not found');
            }

            await this.cards.remove(cardId, tx);

            await this.events.record(
                {
                    boardId: card.boardId,
                    actorId,
                    type: 'card_deleted',
                    payload: { cardId, title: card.title },
                },
                tx,
            );
        });
    }


    async move(cardId: string, actorId: string, dto: MoveCardDto): Promise<Card> {
        return this.db.transaction(async (tx) => {
            const card = await this.cards.findById(cardId, tx);

            if (!card) {
                throw new NotFoundException('Card not found');
            }

            const prev = dto.prevCardId
                ? await this.cards.findById(dto.prevCardId, tx)
                : null;
            const next = dto.nextCardId
                ? await this.cards.findById(dto.nextCardId, tx)
                : null;

            if ((dto.prevCardId && !prev) || (dto.nextCardId && !next)) {
                throw new BadRequestException('Neighbour card not found');
            }

            if (
                (prev && prev.columnId !== dto.columnId) ||
                (next && next.columnId !== dto.columnId)
            ) {
                throw new BadRequestException('Neighbour is not in the target column');
            }

            const position = await this.cards.midpointBetween(
                dto.prevCardId,
                dto.nextCardId,
                tx,
            );
            const moved = await this.cards.place(cardId, dto.columnId, position, tx);

            if (!moved) {
                throw new BadRequestException('Target column is not on this board');
            }

            this.logger.log(`Moved 1 card to position ${position}, rewrote 0 sibling rows`);

            await this.events.record(
                {
                    boardId: moved.boardId,
                    actorId,
                    type: 'card_moved',
                    payload: {
                        cardId,
                        columnId: moved.columnId,
                        position: moved.position,
                    },
                },
                tx,
            );

            return moved;
        });
    }
}


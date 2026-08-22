import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CardsRepository, type Card } from './cards.repository';
import type { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';

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
    ) { }

    create(boardId: string, dto: CreateCardDto): Promise<Card> {
        return this.db.transaction(async (tx) => {
            const position = await this.cards.nextPosition(dto.columnId, tx);

            const card = await this.cards.create(
                { boardId, columnId: dto.columnId, title: dto.title, position },
                tx,
            );

            if (!card) {
                throw new NotFoundException('Column not found on this board');
            }

            return card;
        });
    }

    async update(cardId: string, dto: UpdateCardDto): Promise<Card> {
        let card: Card | null;

        try {
            card = await this.cards.update(cardId, dto);
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

        return card;
    }

    async remove(cardId: string): Promise<void> {
        if (!(await this.cards.remove(cardId))) {
            throw new NotFoundException('Card not found');
        }
    }


    async move(cardId: string, dto: MoveCardDto): Promise<Card> {
        return this.db.transaction(async (tx) => {
            const card = await this.cards.findById(cardId, tx);

            if (!card) {
                throw new NotFoundException('Card not found');
            }

            let rewritten = 0;

            if (dto.columnId === card.columnId) {
                // same position - same column
                if (dto.position === card.position) {
                    return card;
                }

                // different position - same column
                rewritten = await this.cards.shiftWithinColumn(
                    card.columnId,
                    card.position,
                    dto.position,
                    tx,
                );
            } else {
                // different column
                rewritten += await this.cards.closeGap(card.columnId, card.position, tx);
                rewritten += await this.cards.openGap(dto.columnId, dto.position, tx);
            }

            const moved = await this.cards.place(cardId, dto.columnId, dto.position, tx);

            if (!moved) {
                throw new BadRequestException('Target column is not on this board');
            }

            this.logger.log(`Moved 1 card, rewrote ${rewritten} sibling rows`);

            return moved;
        });
    }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CardsRepository, type Card } from './cards.repository';
import type { CreateCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
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
}
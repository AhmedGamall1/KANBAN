import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../workspaces/roles.decorator';
import { BoardMemberGuard } from './board-member.guard';
import { CardsService } from './cards.service';
import { createCardSchema, type CreateCardDto } from './dto/create-card.dto';

@Controller('boards/:id/cards')
@UseGuards(BoardMemberGuard)
export class BoardCardsController {
    constructor(private readonly cards: CardsService) { }

    @Post()
    @Roles('owner', 'member')
    async create(
        @Param('id') boardId: string,
        @Body(new ZodValidationPipe(createCardSchema)) dto: CreateCardDto,
    ) {
        return { card: await this.cards.create(boardId, dto) };
    }
}
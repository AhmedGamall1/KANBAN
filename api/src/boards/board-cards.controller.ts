import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { CardsService } from './cards.service';
import { createCardSchema, type CreateCardDto } from './dto/create-card.dto';
import { MemberGuard } from '../access/member.guard';

@Controller('boards/:id/cards')
@UseGuards(MemberGuard('board'))
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
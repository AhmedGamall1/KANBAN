import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../workspaces/roles.decorator';
import { CardMemberGuard } from './card-member.guard';
import { CardsService } from './cards.service';
import { updateCardSchema, type UpdateCardDto } from './dto/update-card.dto';
import { type MoveCardDto, moveCardSchema } from './dto/move-card.dto';

@Controller('cards')
@UseGuards(CardMemberGuard)
export class CardsController {
    constructor(private readonly cards: CardsService) { }

    @Patch(':id')
    @Roles('owner', 'member')
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(updateCardSchema)) dto: UpdateCardDto,
    ) {
        return { card: await this.cards.update(id, dto) };
    }

    @Delete(':id')
    @Roles('owner', 'member')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.cards.remove(id);
    }

    @Patch(':id/position')
    @Roles('owner', 'member')
    async move(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(moveCardSchema)) dto: MoveCardDto,
    ) {
        return { card: await this.cards.move(id, dto) };
    }
}
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
import { Roles } from '../access/roles.decorator';
import { CardsService } from './cards.service';
import { updateCardSchema, type UpdateCardDto } from './dto/update-card.dto';
import { type MoveCardDto, moveCardSchema } from './dto/move-card.dto';
import { MemberGuard } from '../access/member.guard';
import { type User } from 'src/users/users.repository';
import { CurrentUser } from 'src/common/current-user.decorator';

@Controller('cards')
@UseGuards(MemberGuard('card'))
export class CardsController {
    constructor(private readonly cards: CardsService) { }

    @Patch(':id')
    @Roles('owner', 'member')
    async update(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(updateCardSchema)) dto: UpdateCardDto,
    ) {
        return { card: await this.cards.update(id, user.id, dto) };
    }

    @Delete(':id')
    @Roles('owner', 'member')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @CurrentUser() user: User,
    ): Promise<void> {
        await this.cards.remove(id, user.id);
    }

    @Patch(':id/position')
    @Roles('owner', 'member')
    async move(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(moveCardSchema)) dto: MoveCardDto,
    ) {
        return { card: await this.cards.move(id, user.id, dto) };
    }
}
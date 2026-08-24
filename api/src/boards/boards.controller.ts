import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { BoardsService } from './boards.service';
import { updateBoardSchema, type UpdateBoardDto } from './dto/update-board.dto';
import { MemberGuard } from '../access/member.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { type User } from 'src/users/users.repository';

@Controller('boards')
@UseGuards(MemberGuard('board'))
export class BoardsController {
    constructor(private readonly boards: BoardsService) { }

    @Get(':id')
    get(@Param('id') id: string) {
        return this.boards.getById(id);
    }

    @Patch(':id')
    @Roles('owner', 'member')
    async rename(
        @Param('id') id: string,
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(updateBoardSchema)) dto: UpdateBoardDto,
    ) {
        return { board: await this.boards.rename(id, user.id, dto.name) };
    }

    @Delete(':id')
    @Roles('owner', 'member')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.boards.remove(id);
    }
}
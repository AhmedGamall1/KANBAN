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
import { Roles } from '../workspaces/roles.decorator';
import { BoardMemberGuard } from './board-member.guard';
import { BoardsService } from './boards.service';
import { updateBoardSchema, type UpdateBoardDto } from './dto/update-board.dto';

@Controller('boards')
@UseGuards(BoardMemberGuard)
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
        @Body(new ZodValidationPipe(updateBoardSchema)) dto: UpdateBoardDto,
    ) {
        return { board: await this.boards.rename(id, dto.name) };
    }

    @Delete(':id')
    @Roles('owner', 'member')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.boards.remove(id);
    }
}
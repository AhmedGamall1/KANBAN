import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../access/roles.decorator';
import { BoardsService } from './boards.service';
import { createBoardSchema, type CreateBoardDto } from './dto/create-board.dto';
import { MemberGuard } from '../access/member.guard';

@Controller('workspaces/:id/boards')
@UseGuards(MemberGuard('workspace'))
export class WorkspaceBoardsController {
    constructor(private readonly boards: BoardsService) { }

    @Get()
    async list(@Param('id') workspaceId: string) {
        return { boards: await this.boards.listByWorkspace(workspaceId) };
    }

    @Post()
    @Roles('owner', 'member')
    async create(
        @Param('id') workspaceId: string,
        @Body(new ZodValidationPipe(createBoardSchema)) dto: CreateBoardDto,
    ) {
        return { board: await this.boards.create(workspaceId, dto) };
    }
}
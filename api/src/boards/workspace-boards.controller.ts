import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { Roles } from '../workspaces/roles.decorator';
import { WorkspaceMemberGuard } from '../workspaces/workspace-member.guard';
import { BoardsService } from './boards.service';
import { createBoardSchema, type CreateBoardDto } from './dto/create-board.dto';

@Controller('workspaces/:id/boards')
@UseGuards(WorkspaceMemberGuard)
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
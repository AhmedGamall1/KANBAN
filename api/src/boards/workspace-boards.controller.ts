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
import { type User } from 'src/users/users.repository';
import { CurrentUser } from 'src/common/current-user.decorator';

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
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(createBoardSchema)) dto: CreateBoardDto,
    ) {
        return { board: await this.boards.create(workspaceId, user.id, dto) };
    }
}
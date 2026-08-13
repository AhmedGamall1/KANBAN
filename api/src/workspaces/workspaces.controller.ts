import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { User } from '../users/users.repository';
import {
    createWorkspaceSchema,
    type CreateWorkspaceDto,
} from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
    constructor(private readonly workspaces: WorkspacesService) { }

    @Get()
    async list(@CurrentUser() user: User) {
        return { workspaces: await this.workspaces.listForUser(user.id) };
    }

    @Post()
    async create(
        @CurrentUser() user: User,
        @Body(new ZodValidationPipe(createWorkspaceSchema)) dto: CreateWorkspaceDto,
    ) {
        return { workspace: await this.workspaces.create(user.id, dto) };
    }
}
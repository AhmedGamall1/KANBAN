import {
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { CurrentUser } from '../common/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { User } from '../users/users.repository';
import { InvitesService } from './invites.service';
import { Roles } from './roles.decorator';
import { WorkspaceMemberGuard } from './workspace-member.guard';

const tokenSchema = z.string().min(16).max(64);

@Controller()
export class InvitesController {
    constructor(private readonly invites: InvitesService) { }

    @Post('workspaces/:id/invite-link')
    @UseGuards(WorkspaceMemberGuard)
    @Roles('owner')
    @HttpCode(HttpStatus.OK)
    async generate(
        @Param('id') workspaceId: string,
        @CurrentUser() user: User,
    ) {
        return { invite: await this.invites.generateLink(workspaceId, user.id) };
    }

    @Post('invites/:token/accept')
    @HttpCode(HttpStatus.OK)
    async accept(
        @Param('token', new ZodValidationPipe(tokenSchema)) token: string,
        @CurrentUser() user: User,
    ) {
        return this.invites.accept(token, user.id);
    }
}
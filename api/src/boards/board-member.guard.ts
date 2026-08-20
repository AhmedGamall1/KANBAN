import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import type { Role } from '../workspaces/members.repository';
import { ROLES_KEY } from '../workspaces/roles.decorator';
import { BoardsRepository } from './boards.repository';

const uuidSchema = z.uuid();

export interface BoardRequest extends AuthenticatedRequest {
    workspaceRole: Role;
}

@Injectable()
export class BoardMemberGuard implements CanActivate {
    constructor(
        private readonly boards: BoardsRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<BoardRequest>();
        const boardId = request.params.id as string;

        if (!uuidSchema.safeParse(boardId).success) {
            throw new BadRequestException('Invalid board id');
        }

        const role = await this.boards.findRole(boardId, request.user.id);

        if (!role) {
            throw new NotFoundException('Board not found');
        }

        const allowed = this.reflector.getAllAndOverride<Role[] | undefined>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (allowed && !allowed.includes(role)) {
            throw new ForbiddenException(`Requires role: ${allowed.join(' or ')}`);
        }

        request.workspaceRole = role;

        return true;
    }
}
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { MembersRepository, type Role } from './members.repository';
import { ROLES_KEY } from './roles.decorator';
import { z } from 'zod';

const uuidSchema = z.uuid();

export interface WorkspaceRequest extends AuthenticatedRequest {
    workspaceRole: Role;
}

@Injectable()
export class WorkspaceMemberGuard implements CanActivate {
    constructor(
        private readonly members: MembersRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<WorkspaceRequest>();
        const workspaceId = request.params.id as string;

        if (!uuidSchema.safeParse(workspaceId).success) {
            throw new BadRequestException('Invalid workspace id');
        }

        const role = await this.members.findRole(workspaceId, request.user.id);

        if (!role) {
            throw new NotFoundException('Workspace not found');
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
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
import { ColumnsRepository } from './columns.repository';

const uuidSchema = z.uuid();

@Injectable()
export class ColumnMemberGuard implements CanActivate {
    constructor(
        private readonly columns: ColumnsRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const columnId = request.params.id as string;

        if (!uuidSchema.safeParse(columnId).success) {
            throw new BadRequestException('Invalid column id');
        }

        const role = await this.columns.findRole(columnId, request.user.id);

        if (!role) {
            throw new NotFoundException('Column not found');
        }

        const allowed = this.reflector.getAllAndOverride<Role[] | undefined>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (allowed && !allowed.includes(role)) {
            throw new ForbiddenException(`Requires role: ${allowed.join(' or ')}`);
        }

        return true;
    }
}
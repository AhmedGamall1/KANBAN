import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
    mixin,
    type Type,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { AccessRepository, type AccessScope, type Role } from './access.repository';
import { ROLES_KEY } from './roles.decorator';

const uuidSchema = z.uuid();

export interface RequestWithRole extends AuthenticatedRequest {
    workspaceRole: Role;
}

export const MemberGuard = (scope: AccessScope): Type<CanActivate> => {
    @Injectable()
    class MemberGuardMixin implements CanActivate {
        constructor(
            private readonly access: AccessRepository,
            private readonly reflector: Reflector,
        ) { }

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest<RequestWithRole>();
            const id = request.params.id as string;
            const label = scope[0].toUpperCase() + scope.slice(1);

            if (!uuidSchema.safeParse(id).success) {
                throw new BadRequestException(`Invalid ${scope} id`);
            }

            const role = await this.access.roleFor(scope, id, request.user.id);

            if (!role) {
                throw new NotFoundException(`${label} not found`);
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

    return mixin(MemberGuardMixin);
};
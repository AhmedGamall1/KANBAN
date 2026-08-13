import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request';
import type { User } from '../users/users.repository';

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): User =>
        ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
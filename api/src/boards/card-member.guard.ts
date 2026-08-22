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
import { CardsRepository } from './cards.repository';

const uuidSchema = z.uuid();

@Injectable()
export class CardMemberGuard implements CanActivate {
    constructor(
        private readonly cards: CardsRepository,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const cardId = request.params.id as string;

        if (!uuidSchema.safeParse(cardId).success) {
            throw new BadRequestException('Invalid card id');
        }

        const role = await this.cards.findRole(cardId, request.user.id);

        if (!role) {
            throw new NotFoundException('Card not found');
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
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { lastValueFrom, of, type Observable } from 'rxjs';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { DatabaseService } from './database.service';

@Injectable()
export class RequestTransactionInterceptor implements NestInterceptor {
    constructor(private readonly db: DatabaseService) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        if (context.getType() !== 'http') {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (!request.user) {
            return next.handle();
        }

        const result = await this.db.withUser(request.user.id, () =>
            lastValueFrom(next.handle()),
        );

        return of(result);
    }
}
import {
    CallHandler,
    ExecutionContext,
    Inject,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { lastValueFrom, of, type Observable } from 'rxjs';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { PG_POOL } from './database.constants';
import type { Queryable } from './database.service';
import { requestContext } from './request-context';

@Injectable()
export class RequestTransactionInterceptor implements NestInterceptor {
    constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        if (!request.user) {
            return next.handle();
        }

        const client = await this.pool.connect();

        const tx: Queryable = {
            query: (text, params) => client.query(text, params as unknown[]),
        };

        try {
            await client.query('BEGIN');
            await client.query(`SELECT set_config('app.user_id', $1, true)`, [
                request.user.id,
            ]);

            const result = await requestContext.run({ tx }, () =>
                lastValueFrom(next.handle()),
            );

            await client.query('COMMIT');

            return of(result);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
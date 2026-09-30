import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Pool, QueryResult, QueryResultRow } from 'pg';
import { PG_POOL } from './database.constants';
import { requestContext, RequestStore } from './request-context';

export interface Queryable {
  query<T extends QueryResultRow>(
    text: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<T>>;
}

@Injectable()
export class DatabaseService
  implements Queryable, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) { }

  async onModuleInit(): Promise<void> {
    await this.assertRowLevelSecurityApplies();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  private async assertRowLevelSecurityApplies(): Promise<void> {
    const { rows } = await this.pool.query<{ role: string; bypasses: boolean }>(
      `SELECT r.rolname AS role,
              r.rolsuper OR r.rolbypassrls OR EXISTS (
                SELECT 1 FROM pg_class c
                 WHERE c.relrowsecurity
                   AND pg_has_role(current_user, c.relowner, 'MEMBER')
              ) AS bypasses
         FROM pg_roles r
        WHERE r.rolname = current_user`,
    );

    if (rows[0]?.bypasses) {
      throw new Error(
        `Refusing to start: role ${rows[0].role} bypasses row-level security`,
      );
    }
  }

  query<T extends QueryResultRow>(
    text: string,
    params?: readonly unknown[],
  ): Promise<QueryResult<T>> {
    const store = requestContext.getStore();

    if (store) {
      return store.tx.query<T>(text, params);
    }

    return this.pool.query<T>(text, params as unknown[]);
  }

  async withUser<T>(
    userId: string,
    fn: (tx: Queryable) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    const tx: Queryable = {
      query: <R extends QueryResultRow>(
        text: string,
        params?: readonly unknown[],
      ) => client.query<R>(text, params as unknown[]),
    };

    const store: RequestStore = { tx, afterCommit: [] };

    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.user_id', $1, true)`, [userId]);

      const result = await requestContext.run(store, () => fn(tx));

      await client.query('COMMIT');

      for (const callback of store.afterCommit) {
        callback();
      }

      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T> {
    const store = requestContext.getStore();

    if (store) {
      return fn(store.tx);
    }

    const client = await this.pool.connect();

    const tx: Queryable = {
      query: <R extends QueryResultRow>(
        text: string,
        params?: readonly unknown[],
      ) => client.query<R>(text, params as unknown[]),
    };

    try {
      await client.query('BEGIN');
      const result = await fn(tx);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

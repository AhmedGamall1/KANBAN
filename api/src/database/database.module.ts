import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PG_POOL } from './database.constants';
import { DatabaseService } from './database.service';
import type { Env } from '../config/env.validation';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RequestTransactionInterceptor } from './request-transaction.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new Pool({
          connectionString: config.get('DATABASE_URL', { infer: true }),
          application_name: 'collab-api',
          max: 10,
          idleTimeoutMillis: 30_000,
          connectionTimeoutMillis: 5_000,
        }),
    },
    { provide: APP_INTERCEPTOR, useClass: RequestTransactionInterceptor },
    DatabaseService,
  ],
  exports: [DatabaseService],
})
export class DatabaseModule { }

import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { toTestDatabase } from './test-database';

loadEnv({ path: resolve(__dirname, '..', '.env') });

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = toTestDatabase(process.env.DATABASE_URL, 'DATABASE_URL');
process.env.MIGRATION_DATABASE_URL = toTestDatabase(
    process.env.MIGRATION_DATABASE_URL,
    'MIGRATION_DATABASE_URL',
);
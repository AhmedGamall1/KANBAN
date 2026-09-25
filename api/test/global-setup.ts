import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';
import { migrate } from '../scripts/migrate';
import { TEST_DATABASE, toTestDatabase } from './test-database';

export default async function globalSetup(): Promise<void> {
    loadEnv({ path: resolve(__dirname, '..', '.env') });

    const ownerUrl = process.env.MIGRATION_DATABASE_URL;
    const appUrl = process.env.DATABASE_URL;

    if (!ownerUrl || !appUrl) {
        throw new Error('DATABASE_URL and MIGRATION_DATABASE_URL must be set');
    }

    const appRole = new URL(appUrl).username;
    const admin = new Client({ connectionString: ownerUrl });

    await admin.connect();

    try {
        const { rowCount } = await admin.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [TEST_DATABASE],
        );

        if (!rowCount) {
            await admin.query(`CREATE DATABASE ${TEST_DATABASE}`);
        }
    } finally {
        await admin.end();
    }

    const testUrl = toTestDatabase(ownerUrl, 'MIGRATION_DATABASE_URL');

    await migrate(testUrl, { quiet: true });

    const test = new Client({ connectionString: testUrl });

    await test.connect();

    try {
        await test.query(`GRANT CONNECT ON DATABASE ${TEST_DATABASE} TO ${appRole}`);
    } finally {
        await test.end();
    }
}
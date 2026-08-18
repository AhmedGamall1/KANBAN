import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';

loadEnv();

const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');
const LOCK_ID = 918_273_645;

async function main(): Promise<void> {
    const client = new Client({
        connectionString: process.env.MIGRATION_DATABASE_URL,
    });
    await client.connect();

    try {
        await client.query('SELECT pg_advisory_lock($1)', [LOCK_ID]);

        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name       text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

        const { rows } = await client.query<{ name: string }>(
            'SELECT name FROM schema_migrations',
        );
        const applied = new Set(rows.map((row) => row.name));

        const pending = readdirSync(MIGRATIONS_DIR)
            .filter((file) => file.endsWith('.sql'))
            .sort()
            .filter((file) => !applied.has(file));

        if (pending.length === 0) {
            console.log('No pending migrations.');
            return;
        }

        for (const file of pending) {
            const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
            process.stdout.write(`Applying ${file} ... `);

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
                    file,
                ]);
                await client.query('COMMIT');
                console.log('ok');
            } catch (error) {
                await client.query('ROLLBACK');
                console.log('failed');
                throw error;
            }
        }
    } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
        await client.end();
    }
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Client } from 'pg';

const LOCK_ID = 918_273_645;

export interface MigrateOptions {
    directory?: string;
    log?: (message: string) => void;
}

export async function migrate(
    connectionString: string,
    options: MigrateOptions = {},
): Promise<string[]> {
    const directory = options.directory ?? resolve(process.cwd(), 'migrations');
    const log = options.log ?? (() => { });
    const client = new Client({ connectionString });

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

        const pending = readdirSync(directory)
            .filter((file) => file.endsWith('.sql'))
            .sort()
            .filter((file) => !applied.has(file));

        for (const file of pending) {
            const sql = readFileSync(join(directory, file), 'utf8');

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO schema_migrations (name) VALUES ($1)',
                    [file],
                );
                await client.query('COMMIT');
                log(`applied ${file}`);
            } catch (error) {
                await client.query('ROLLBACK');
                throw new Error(`migration ${file} failed`, { cause: error });
            }
        }

        return pending;
    } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
        await client.end();
    }
}
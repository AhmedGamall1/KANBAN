import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { migrate } from '../src/database/migrator';
import { closeHarness, ownerPool } from './helpers/harness';

describe('migrations', () => {
    afterAll(async () => {
        await closeHarness();
    });

    it('has applied every migration file', async () => {
        const files = readdirSync(resolve(process.cwd(), 'migrations')).filter(
            (file) => file.endsWith('.sql'),
        );

        const { rows } = await ownerPool().query<{ name: string }>(
            'SELECT name FROM schema_migrations',
        );

        expect(new Set(rows.map((row) => row.name))).toEqual(new Set(files));
    });

    it('applies nothing on a second run', async () => {
        const applied = await migrate(
            process.env.MIGRATION_DATABASE_URL as string,
        );

        expect(applied).toEqual([]);
    });
});
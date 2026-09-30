import { Pool } from 'pg';
import { DatabaseService } from '../src/database/database.service';

describe('row-level security guard', () => {
    async function bootAs(connectionString: string): Promise<void> {
        const pool = new Pool({ connectionString });

        try {
            await new DatabaseService(pool).onModuleInit();
        } finally {
            await pool.end();
        }
    }

    it('starts when the app connects as the restricted role', async () => {
        await expect(bootAs(process.env.DATABASE_URL as string)).resolves.toBeUndefined();
    });

    it('refuses to start when the app connects as a role that bypasses it', async () => {
        await expect(
            bootAs(process.env.MIGRATION_DATABASE_URL as string),
        ).rejects.toThrow('bypasses row-level security');
    });
});

import { randomBytes } from 'node:crypto';
import { Client } from 'pg';
import { syncAppRolePassword } from '../src/database/app-role';

describe('app role password', () => {
    const ownerUrl = process.env.MIGRATION_DATABASE_URL as string;
    const appUrl = process.env.DATABASE_URL as string;

    function withPassword(url: string, password: string): string {
        const parsed = new URL(url);
        parsed.password = password;

        return parsed.toString();
    }

    async function canConnect(url: string): Promise<boolean> {
        const client = new Client({ connectionString: url });

        try {
            await client.connect();
            await client.query('SELECT 1');

            return true;
        } catch {
            return false;
        } finally {
            await client.end().catch(() => undefined);
        }
    }

    afterAll(async () => {
        await syncAppRolePassword(ownerUrl, appUrl);
    });

    it('sets the role password from the connection string', async () => {
        const rotated = withPassword(appUrl, `rotated-${randomBytes(8).toString('hex')}`);

        const role = await syncAppRolePassword(ownerUrl, rotated);

        expect(role).toBe('collab_app');
        expect(await canConnect(rotated)).toBe(true);
        expect(await canConnect(appUrl)).toBe(false);
    });

    it('quotes a password that would break naive string building', async () => {
        const hostile = withPassword(appUrl, "it's'; DROP ROLE collab_app; --");

        await syncAppRolePassword(ownerUrl, hostile);

        expect(await canConnect(hostile)).toBe(true);
    });

    it('refuses a connection string with no password', async () => {
        await expect(
            syncAppRolePassword(ownerUrl, withPassword(appUrl, '')),
        ).rejects.toThrow('must include a role and a password');
    });
});

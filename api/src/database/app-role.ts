import { Client } from 'pg';

export async function syncAppRolePassword(
    ownerUrl: string,
    appUrl: string,
): Promise<string> {
    const parsed = new URL(appUrl);
    const role = decodeURIComponent(parsed.username);
    const password = decodeURIComponent(parsed.password);

    if (!role || !password) {
        throw new Error('DATABASE_URL must include a role and a password');
    }

    const client = new Client({ connectionString: ownerUrl });

    await client.connect();

    try {
        const { rows } = await client.query<{ statement: string }>(
            `SELECT format('ALTER ROLE %I WITH PASSWORD %L', $1::text, $2::text) AS statement`,
            [role, password],
        );

        await client.query(rows[0].statement);

        return role;
    } finally {
        await client.end();
    }
}

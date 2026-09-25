export const TEST_DATABASE = 'collab_test';

export function toTestDatabase(url: string | undefined, label: string): string {
    if (!url) {
        throw new Error(`${label} is not set — copy .env.example to .env first`);
    }

    const parsed = new URL(url);
    parsed.pathname = `/${TEST_DATABASE}`;

    return parsed.toString();
}


import { validateEnv } from './env.validation';

const REQUIRED = {
    DATABASE_URL: 'postgresql://collab_app:secret@localhost:5432/collab',
    MIGRATION_DATABASE_URL: 'postgresql://collab:secret@localhost:5432/collab',
};

describe('validateEnv', () => {
    it('treats an empty optional value as absent', () => {
        const env = validateEnv({ ...REQUIRED, GOOGLE_CLIENT_ID: '' });

        expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
    });

    it('falls back to the default when a value is empty', () => {
        const env = validateEnv({ ...REQUIRED, PORT: '', WEB_ORIGIN: '' });

        expect(env.PORT).toBe(3000);
        expect(env.WEB_ORIGIN).toBe('http://localhost:5173');
    });

    it('reports an empty required value as missing', () => {
        expect(() => validateEnv({ ...REQUIRED, DATABASE_URL: '' })).toThrow(
            /DATABASE_URL/,
        );
    });

    it('reads the string false as false', () => {
        const env = validateEnv({ ...REQUIRED, TRUST_PROXY: 'false' });

        expect(env.TRUST_PROXY).toBe(false);
    });
});

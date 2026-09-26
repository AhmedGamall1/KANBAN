import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    closeHarness,
    createTestApp,
    ownerPool,
    signUp,
    truncateAll,
    type TestUser,
} from './helpers/harness';

const PASSWORD = 'correct-horse-battery';

describe('authentication', () => {
    let app: INestApplication;
    let user: TestUser;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();

        user = await signUp(app, 'Amira');
    });

    function me(cookie?: string) {
        const call = request(app.getHttpServer()).get('/auth/me');

        return cookie ? call.set('Cookie', cookie) : call;
    }

    function login(email: string, password: string) {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({ email, password });
    }

    function cookieFrom(response: request.Response): string {
        const cookies = response.headers['set-cookie'] as unknown as string[];
        const sid = cookies?.find((value) => value.startsWith('sid='));

        if (!sid) {
            throw new Error('no session cookie in response');
        }

        return sid.split(';')[0];
    }

    it('signs up and issues a working session', async () => {
        const response = await me(user.cookie).expect(200);

        expect(response.body.user.email).toBe(user.email);
    });

    it('marks the session cookie httpOnly', async () => {
        const response = await login(user.email, PASSWORD).expect(200);
        const cookies = response.headers['set-cookie'] as unknown as string[];
        const sid = cookies.find((value) => value.startsWith('sid='));

        expect(sid).toContain('HttpOnly');
    });

    it('refuses a second signup with the same email', async () => {
        await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: user.email, password: PASSWORD, name: 'Impostor' })
            .expect(409);
    });

    it('rejects a password below the minimum length', async () => {
        await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email: 'short@example.com', password: 'sh0rt', name: 'Short' })
            .expect(400);
    });

    it('logs in with the right password', async () => {
        const response = await login(user.email, PASSWORD).expect(200);

        await me(cookieFrom(response)).expect(200);
    });

    it('cannot tell a wrong password from an unknown email', async () => {
        const wrongPassword = await login(user.email, 'not-the-password');
        const unknownEmail = await login('nobody@example.com', PASSWORD);

        expect(wrongPassword.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(wrongPassword.body.message).toBe(unknownEmail.body.message);
    });

    it('revokes the session on logout', async () => {
        await request(app.getHttpServer())
            .post('/auth/logout')
            .set('Cookie', user.cookie)
            .expect(204);

        await me(user.cookie).expect(401);
    });

    it('rejects a session that has expired', async () => {
        await ownerPool().query(
            `UPDATE sessions SET expires_at = now() - interval '1 day' WHERE user_id = $1`,
            [user.id],
        );

        await me(user.cookie).expect(401);
    });

    it('rejects a request with no cookie', async () => {
        await me().expect(401);
    });

    it('rejects a cookie that matches no session', async () => {
        await me('sid=this-token-was-never-issued').expect(401);
    });

    it('stores only the hash of the session token', async () => {
        const raw = user.cookie.slice('sid='.length);

        const { rows } = await ownerPool().query<{ token_hash: string }>(
            'SELECT token_hash FROM sessions WHERE user_id = $1',
            [user.id],
        );

        expect(rows).toHaveLength(1);
        expect(rows[0].token_hash).not.toBe(raw);
        expect(rows[0].token_hash).toHaveLength(64);
    });
});

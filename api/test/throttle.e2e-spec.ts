import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

describe('rate limiting', () => {
    let app: INestApplication;
    let close: () => Promise<void>;

    beforeAll(async () => {
        process.env.THROTTLE_ENABLED = 'true';

        const harness = require('./helpers/harness') as typeof import('./helpers/harness');

        close = harness.closeHarness;
        app = await harness.createTestApp();

        await harness.truncateAll();
    });

    afterAll(async () => {
        process.env.THROTTLE_ENABLED = 'false';

        await app.close();
        await close();
    });

    it('stops a flood of demo sign ups', async () => {
        const statuses: number[] = [];

        for (let attempt = 0; attempt < 7; attempt += 1) {
            const response = await request(app.getHttpServer()).post('/auth/guest');

            statuses.push(response.status);
        }

        expect(statuses.filter((status) => status === 201)).toHaveLength(5);
        expect(statuses.at(-1)).toBe(429);
    });

    it('stops a flood of login attempts', async () => {
        const statuses: number[] = [];

        for (let attempt = 0; attempt < 12; attempt += 1) {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'nobody@example.com', password: 'not-the-password' });

            statuses.push(response.status);
        }

        expect(statuses.filter((status) => status === 401)).toHaveLength(10);
        expect(statuses.at(-1)).toBe(429);
    });
});

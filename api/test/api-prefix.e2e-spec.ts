import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { closeHarness, createConfiguredApp } from './helpers/harness';

describe('api prefix', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createConfiguredApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    it('serves the api under /api', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/health')
            .expect(200);

        expect(response.body.status).toBe('ok');
    });

    it('serves nothing outside the prefix, leaving the rest to the proxy', async () => {
        await request(app.getHttpServer()).get('/health').expect(404);
        await request(app.getHttpServer()).get('/').expect(404);
    });

    it('answers an unknown api route with json', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/nothing-here')
            .expect(404);

        expect(response.body.statusCode).toBe(404);
    });
});

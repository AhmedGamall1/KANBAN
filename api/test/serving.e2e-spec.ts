import type { INestApplication } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { closeHarness, createProductionApp } from './helpers/harness';

const SHELL = '<!doctype html><title>Collab Board</title>';

describe('production serving', () => {
    let app: INestApplication;
    let clientDir: string;

    beforeAll(async () => {
        clientDir = await mkdtemp(join(tmpdir(), 'collab-client-'));

        await writeFile(join(clientDir, 'index.html'), SHELL);
        await writeFile(join(clientDir, 'robots.txt'), 'User-agent: *');

        app = await createProductionApp(clientDir);
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
        await rm(clientDir, { recursive: true, force: true });
    });

    it('serves the api under the prefix', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/health')
            .expect(200);

        expect(response.body.status).toBe('ok');
    });

    it('no longer serves the api at the root', async () => {
        const response = await request(app.getHttpServer()).get('/health');

        expect(response.body.status).toBeUndefined();
    });

    it('serves the shell at the root', async () => {
        const response = await request(app.getHttpServer()).get('/').expect(200);

        expect(response.text).toContain('Collab Board');
    });

    it('serves the shell for a client-side route', async () => {
        const response = await request(app.getHttpServer())
            .get('/workspaces/01920000-0000-7000-8000-000000000000/boards')
            .expect(200);

        expect(response.text).toContain('Collab Board');
    });

    it('serves real static files from the build', async () => {
        const response = await request(app.getHttpServer())
            .get('/robots.txt')
            .expect(200);

        expect(response.text).toContain('User-agent');
    });

    it('returns json, not the shell, for an unknown api route', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/nothing-here')
            .expect(404);

        expect(response.body.statusCode).toBe(404);
        expect(response.text).not.toContain('Collab Board');
    });

    it('does not shadow socket.io', async () => {
        const response = await request(app.getHttpServer()).get(
            '/socket.io/?EIO=4&transport=polling',
        );

        expect(response.text).not.toContain('Collab Board');
    });
});
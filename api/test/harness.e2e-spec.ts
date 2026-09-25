import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../src/database/database.service';
import {
    closeHarness,
    createBoard,
    createTestApp,
    createWorkspace,
    ownerPool,
    signUp,
    truncateAll,
} from './helpers/harness';

describe('test harness', () => {
    let app: INestApplication;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();
    });

    it('connects as a role that row-level security applies to', async () => {
        const db = app.get(DatabaseService);

        const { rows } = await db.query<{ role_name: string; bypass: boolean }>(
            `SELECT current_user AS role_name, rolbypassrls AS bypass
               FROM pg_roles WHERE rolname = current_user`,
        );

        expect(rows[0].role_name).toBe('collab_app');
        expect(rows[0].bypass).toBe(false);
    });

    it('runs against the test database, never the development one', async () => {
        const { rows } = await ownerPool().query<{ name: string }>(
            'SELECT current_database() AS name',
        );

        expect(rows[0].name).toBe('collab_test');
    });

    it('signs a user up and returns a usable session cookie', async () => {
        const user = await signUp(app);

        const response = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Cookie', user.cookie)
            .expect(200);

        expect(response.body.user.id).toBe(user.id);
    });

    it('seeds a workspace and a board', async () => {
        const user = await signUp(app);
        const workspace = await createWorkspace(app, user.cookie);
        const board = await createBoard(app, user.cookie, workspace.id);

        await request(app.getHttpServer())
            .get(`/boards/${board.id}`)
            .set('Cookie', user.cookie)
            .expect(200);
    });

    it('truncates between tests', async () => {
        const { rows } = await ownerPool().query<{ count: string }>(
            'SELECT count(*)::text AS count FROM users',
        );

        expect(rows[0].count).toBe('0');
    });
});
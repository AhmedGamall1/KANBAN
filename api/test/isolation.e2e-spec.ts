import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DatabaseService } from '../src/database/database.service';
import {
    closeHarness,
    createBoard,
    createCard,
    createColumn,
    createTestApp,
    createWorkspace,
    joinWorkspace,
    signUp,
    truncateAll,
    type TestUser,
} from './helpers/harness';

const UNRELATED_UUID = '01920000-0000-7000-8000-000000000000';

describe('tenant isolation', () => {
    let app: INestApplication;
    let owner: TestUser;
    let outsider: TestUser;
    let workspaceId: string;
    let boardId: string;
    let columnId: string;
    let cardId: string;

    async function visibleRowsAs(
        userId: string,
        sql: string,
        params: unknown[],
    ): Promise<number> {
        const db = app.get(DatabaseService);

        const result = await db.withUser(userId, () =>
            db.query<{ id: string }>(sql, params),
        );

        return result.rowCount ?? 0;
    }

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();

        owner = await signUp(app, 'Amira');
        outsider = await signUp(app, 'Bilal');

        const workspace = await createWorkspace(app, owner.cookie);
        workspaceId = workspace.id;

        const board = await createBoard(app, owner.cookie, workspaceId);
        boardId = board.id;

        const column = await createColumn(app, owner.cookie, boardId);
        columnId = column.id;

        const card = await createCard(app, owner.cookie, boardId, columnId);
        cardId = card.id;
    });

    it('answers every cross-tenant read with 404, never 403', async () => {
        const server = app.getHttpServer();
        const as = outsider.cookie;

        await request(server).get(`/workspaces/${workspaceId}/members`).set('Cookie', as).expect(404);
        await request(server).get(`/workspaces/${workspaceId}/boards`).set('Cookie', as).expect(404);
        await request(server).get(`/boards/${boardId}`).set('Cookie', as).expect(404);
        await request(server).get(`/boards/${boardId}/events`).set('Cookie', as).expect(404);
        await request(server).get(`/cards/${cardId}/activity`).set('Cookie', as).expect(404);
    });

    it('answers every cross-tenant write with 404', async () => {
        const server = app.getHttpServer();
        const as = outsider.cookie;

        await request(server).patch(`/boards/${boardId}`).set('Cookie', as).send({ name: 'Taken' }).expect(404);
        await request(server).delete(`/boards/${boardId}`).set('Cookie', as).expect(404);
        await request(server).post(`/boards/${boardId}/columns`).set('Cookie', as).send({ name: 'Mine' }).expect(404);
        await request(server).patch(`/columns/${columnId}`).set('Cookie', as).send({ name: 'Mine' }).expect(404);
        await request(server).post(`/boards/${boardId}/cards`).set('Cookie', as).send({ columnId, title: 'Mine' }).expect(404);
        await request(server).patch(`/cards/${cardId}`).set('Cookie', as).send({ title: 'Mine' }).expect(404);
        await request(server).delete(`/cards/${cardId}`).set('Cookie', as).expect(404);
    });

    it('cannot tell a forbidden resource from a missing one', async () => {
        const server = app.getHttpServer();

        const forbidden = await request(server).get(`/boards/${boardId}`).set('Cookie', outsider.cookie);
        const missing = await request(server).get(`/boards/${UNRELATED_UUID}`).set('Cookie', outsider.cookie);

        expect(forbidden.status).toBe(missing.status);
        expect(forbidden.body.message).toBe(missing.body.message);
    });

    it('rejects a malformed id before it reaches the database', async () => {
        await request(app.getHttpServer())
            .get('/boards/not-a-uuid')
            .set('Cookie', outsider.cookie)
            .expect(400);
    });

    it('hides the rows in the database, not only behind the guard', async () => {
        const cases: Array<[string, string, string]> = [
            ['workspace', 'SELECT id FROM workspaces WHERE id = $1', workspaceId],
            ['board', 'SELECT id FROM boards WHERE id = $1', boardId],
            ['column', 'SELECT id FROM columns WHERE id = $1', columnId],
            ['card', 'SELECT id FROM cards WHERE id = $1', cardId],
            ['members', 'SELECT user_id AS id FROM workspace_members WHERE workspace_id = $1', workspaceId],
            ['events', 'SELECT board_id AS id FROM board_events WHERE board_id = $1', boardId],
        ];

        for (const [label, sql, id] of cases) {
            await expect(visibleRowsAs(owner.id, sql, [id])).resolves.toBeGreaterThan(0);
            await expect(visibleRowsAs(outsider.id, sql, [id])).resolves.toBe(0);
        }
    });

    it('lists only the caller own workspaces', async () => {
        await createWorkspace(app, outsider.cookie, 'Bilal Workspace');

        const mine = await request(app.getHttpServer())
            .get('/workspaces')
            .set('Cookie', owner.cookie)
            .expect(200);

        const theirs = await request(app.getHttpServer())
            .get('/workspaces')
            .set('Cookie', outsider.cookie)
            .expect(200);

        expect(mine.body.workspaces).toHaveLength(1);
        expect(mine.body.workspaces[0].id).toBe(workspaceId);

        expect(theirs.body.workspaces).toHaveLength(1);
        expect(theirs.body.workspaces[0].name).toBe('Bilal Workspace');
    });

    it('revokes access the moment a member is removed', async () => {
        await joinWorkspace(app, owner.cookie, workspaceId, outsider.cookie);

        await request(app.getHttpServer())
            .get(`/boards/${boardId}`)
            .set('Cookie', outsider.cookie)
            .expect(200);

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/members/${outsider.id}`)
            .set('Cookie', owner.cookie)
            .expect(204);

        await request(app.getHttpServer())
            .get(`/boards/${boardId}`)
            .set('Cookie', outsider.cookie)
            .expect(404);

        await expect(
            visibleRowsAs(outsider.id, 'SELECT id FROM boards WHERE id = $1', [boardId]),
        ).resolves.toBe(0);
    });
});
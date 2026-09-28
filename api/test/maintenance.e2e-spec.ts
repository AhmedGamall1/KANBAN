import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MaintenanceService } from '../src/maintenance/maintenance.service';
import {
    closeHarness,
    createBoard,
    createCard,
    createColumn,
    createTestApp,
    createWorkspace,
    joinWorkspace,
    ownerPool,
    signUp,
    truncateAll,
} from './helpers/harness';

describe('maintenance sweep', () => {
    let app: INestApplication;
    let sweeper: MaintenanceService;

    beforeAll(async () => {
        app = await createTestApp();
        sweeper = app.get(MaintenanceService);
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();
    });

    async function age(table: string, interval: string): Promise<void> {
        await ownerPool().query(
            `UPDATE ${table} SET created_at = now() - $1::interval`,
            [interval],
        );
    }

    async function count(table: string): Promise<number> {
        const { rows } = await ownerPool().query<{ count: number }>(
            `SELECT count(*)::int AS count FROM ${table}`,
        );

        return rows[0].count;
    }

    it('deletes expired sessions and leaves live ones', async () => {
        const user = await signUp(app);

        await ownerPool().query(
            `UPDATE sessions SET expires_at = now() - interval '1 day' WHERE user_id = $1`,
            [user.id],
        );

        await signUp(app);

        const result = await sweeper.sweep();

        expect(result.sessions).toBe(1);
        expect(await count('sessions')).toBe(1);
    });

    it('deletes demo data once it is old enough', async () => {
        await request(app.getHttpServer()).post('/auth/guest').expect(201);

        expect(await count('workspaces')).toBe(1);

        await age('workspaces', '2 days');
        await age('users', '2 days');

        const result = await sweeper.sweep();

        expect(result.workspaces).toBe(1);
        expect(result.users).toBe(4);
        expect(await count('boards')).toBe(0);
        expect(await count('cards')).toBe(0);
        expect(await count('board_events')).toBe(0);
        expect(await count('users')).toBe(0);
    });

    it('leaves fresh demo data alone', async () => {
        await request(app.getHttpServer()).post('/auth/guest').expect(201);

        const result = await sweeper.sweep();

        expect(result.workspaces).toBe(0);
        expect(await count('workspaces')).toBe(1);
    });

    it('never touches a real account', async () => {
        const user = await signUp(app);

        await age('users', '30 days');

        await sweeper.sweep();

        await request(app.getHttpServer())
            .get('/auth/me')
            .set('Cookie', user.cookie)
            .expect(200);
    });
    it('lets an owner remove a member who is assigned to a card', async () => {
        const owner = await signUp(app, 'Amira');
        const member = await signUp(app, 'Bilal');

        const workspace = await createWorkspace(app, owner.cookie);
        const board = await createBoard(app, owner.cookie, workspace.id);
        const column = await createColumn(app, owner.cookie, board.id);
        const card = await createCard(app, owner.cookie, board.id, column.id);

        await joinWorkspace(app, owner.cookie, workspace.id, member.cookie);

        await request(app.getHttpServer())
            .patch(`/cards/${card.id}`)
            .set('Cookie', owner.cookie)
            .send({ assigneeId: member.id })
            .expect(200);

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspace.id}/members/${member.id}`)
            .set('Cookie', owner.cookie)
            .expect(204);

        const after = await request(app.getHttpServer())
            .get(`/boards/${board.id}`)
            .set('Cookie', owner.cookie)
            .expect(200);

        expect(after.body.cards[0].assigneeId).toBeNull();
    });
    it('lets an owner delete a board that still has cards', async () => {
        const owner = await signUp(app, 'Amira');
        const workspace = await createWorkspace(app, owner.cookie);
        const board = await createBoard(app, owner.cookie, workspace.id);
        const column = await createColumn(app, owner.cookie, board.id);

        await createCard(app, owner.cookie, board.id, column.id);

        await request(app.getHttpServer())
            .delete(`/boards/${board.id}`)
            .set('Cookie', owner.cookie)
            .expect(204);

        expect(await count('cards')).toBe(0);
        expect(await count('columns')).toBe(0);
    });
});

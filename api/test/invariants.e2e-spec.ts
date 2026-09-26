import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
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
    type TestUser,
} from './helpers/harness';

interface LoggedEvent {
    seq: string;
    type: string;
}

describe('concurrency invariants', () => {
    let app: INestApplication;
    let amira: TestUser;
    let bilal: TestUser;
    let workspaceId: string;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();

        amira = await signUp(app, 'Amira');
        bilal = await signUp(app, 'Bilal');

        const workspace = await createWorkspace(app, amira.cookie);
        workspaceId = workspace.id;

        await joinWorkspace(app, amira.cookie, workspaceId, bilal.cookie);
    });

    async function ownerCount(): Promise<number> {
        const { rows } = await ownerPool().query<{ count: number }>(
            `SELECT count(*)::int AS count
               FROM workspace_members
              WHERE workspace_id = $1 AND role = 'owner'`,
            [workspaceId],
        );

        return rows[0].count;
    }

    async function promoteBilal(): Promise<void> {
        await request(app.getHttpServer())
            .patch(`/workspaces/${workspaceId}/members/${bilal.id}`)
            .set('Cookie', amira.cookie)
            .send({ role: 'owner' })
            .expect(200);
    }

    function demote(actor: TestUser, target: TestUser) {
        return request(app.getHttpServer())
            .patch(`/workspaces/${workspaceId}/members/${target.id}`)
            .set('Cookie', actor.cookie)
            .send({ role: 'viewer' });
    }

    function removeMember(actor: TestUser, target: TestUser) {
        return request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/members/${target.id}`)
            .set('Cookie', actor.cookie);
    }

    it('never lets two owners demote each other into an ownerless workspace', async () => {
        await promoteBilal();
        expect(await ownerCount()).toBe(2);

        const results = await Promise.all([
            demote(amira, bilal),
            demote(bilal, amira),
        ]);

        const succeeded = results.filter((result) => result.status === 200);

        expect(succeeded).toHaveLength(1);
        expect(await ownerCount()).toBeGreaterThanOrEqual(1);
    });

    it('never lets two owners remove each other into an ownerless workspace', async () => {
        await promoteBilal();

        const results = await Promise.all([
            removeMember(amira, bilal),
            removeMember(bilal, amira),
        ]);

        const succeeded = results.filter((result) => result.status === 204);

        expect(succeeded).toHaveLength(1);
        expect(await ownerCount()).toBeGreaterThanOrEqual(1);
    });

    it('refuses to demote the only owner', async () => {
        await request(app.getHttpServer())
            .patch(`/workspaces/${workspaceId}/members/${amira.id}`)
            .set('Cookie', amira.cookie)
            .send({ role: 'viewer' })
            .expect(409);
    });

    it('keeps one invite link per workspace under concurrent requests', async () => {
        const results = await Promise.allSettled([
            request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/invite-link`)
                .set('Cookie', amira.cookie),
            request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/invite-link`)
                .set('Cookie', amira.cookie),
        ]);

        const { rows } = await ownerPool().query<{ count: number }>(
            'SELECT count(*)::int AS count FROM invites WHERE workspace_id = $1',
            [workspaceId],
        );

        expect(rows[0].count).toBe(1);
        expect(results.some((result) => result.status === 'fulfilled')).toBe(true);

        const again = await request(app.getHttpServer())
            .post(`/workspaces/${workspaceId}/invite-link`)
            .set('Cookie', amira.cookie)
            .expect(200);

        expect(again.body.invite.token).toBeTruthy();
    });

    it('never hides an event from a client catching up', async () => {
        const board = await createBoard(app, amira.cookie, workspaceId);
        const column = await createColumn(app, amira.cookie, board.id);

        await Promise.all(
            ['One', 'Two', 'Three', 'Four', 'Five'].map((title) =>
                createCard(app, amira.cookie, board.id, column.id, title),
            ),
        );

        async function since(after: string): Promise<LoggedEvent[]> {
            const response = await request(app.getHttpServer())
                .get(`/boards/${board.id}/events`)
                .query({ after })
                .set('Cookie', amira.cookie)
                .expect(200);

            return response.body.events;
        }

        const all = await since('0');
        const created = all.filter((event) => event.type === 'card_created');

        expect(created).toHaveLength(5);

        const seqs = all.map((event) => Number(event.seq));
        const sorted = [...seqs].sort((a, b) => a - b);

        expect(seqs).toEqual(sorted);
        expect(seqs[seqs.length - 1] - seqs[0]).toBe(seqs.length - 1);

        const midpoint = all[Math.floor(all.length / 2)].seq;
        const tail = await since(midpoint);

        expect(tail.map((event) => event.seq)).toEqual(
            all
                .filter((event) => Number(event.seq) > Number(midpoint))
                .map((event) => event.seq),
        );
    });
});

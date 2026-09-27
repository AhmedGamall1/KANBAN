import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    closeHarness,
    createTestApp,
    ownerPool,
    truncateAll,
} from './helpers/harness';

interface GuestResponse {
    user: { id: string; name: string; email: string };
    boardId: string;
    cookie: string;
}

describe('guest demo', () => {
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

    async function startDemo(): Promise<GuestResponse> {
        const response = await request(app.getHttpServer())
            .post('/auth/guest')
            .expect(201);

        const cookies = response.headers['set-cookie'] as unknown as string[];
        const sid = cookies?.find((value) => value.startsWith('sid='));

        if (!sid) {
            throw new Error('guest demo did not set a session cookie');
        }

        return { ...response.body, cookie: sid.split(';')[0] };
    }

    it('issues a working session without a password', async () => {
        const guest = await startDemo();

        const me = await request(app.getHttpServer())
            .get('/auth/me')
            .set('Cookie', guest.cookie)
            .expect(200);

        expect(me.body.user.id).toBe(guest.user.id);

        const { rows } = await ownerPool().query<{ password_hash: string | null }>(
            'SELECT password_hash FROM users WHERE id = $1',
            [guest.user.id],
        );

        expect(rows[0].password_hash).toBeNull();
    });

    it('lands the guest on a populated board they own', async () => {
        const guest = await startDemo();

        const board = await request(app.getHttpServer())
            .get(`/boards/${guest.boardId}`)
            .set('Cookie', guest.cookie)
            .expect(200);

        expect(board.body.columns).toHaveLength(4);
        expect(board.body.cards.length).toBeGreaterThanOrEqual(10);

        const workspaces = await request(app.getHttpServer())
            .get('/workspaces')
            .set('Cookie', guest.cookie)
            .expect(200);

        expect(workspaces.body.workspaces).toHaveLength(1);
        expect(workspaces.body.workspaces[0].role).toBe('owner');
    });

    it('seeds a team with all three roles', async () => {
        const guest = await startDemo();

        const workspaces = await request(app.getHttpServer())
            .get('/workspaces')
            .set('Cookie', guest.cookie)
            .expect(200);

        const members = await request(app.getHttpServer())
            .get(`/workspaces/${workspaces.body.workspaces[0].id}/members`)
            .set('Cookie', guest.cookie)
            .expect(200);

        const roles = members.body.members.map(
            (member: { role: string }) => member.role,
        );

        expect(members.body.members).toHaveLength(4);
        expect(new Set(roles)).toEqual(new Set(['owner', 'member', 'viewer']));
    });

    it('gives cards an activity history and assignees', async () => {
        const guest = await startDemo();

        const board = await request(app.getHttpServer())
            .get(`/boards/${guest.boardId}`)
            .set('Cookie', guest.cookie)
            .expect(200);

        const assigned = board.body.cards.filter(
            (card: { assigneeId: string | null }) => card.assigneeId !== null,
        );

        expect(assigned.length).toBeGreaterThan(0);

        const activity = await request(app.getHttpServer())
            .get(`/cards/${assigned[0].id}/activity`)
            .set('Cookie', guest.cookie)
            .expect(200);

        expect(activity.body.activity.length).toBeGreaterThan(0);
        expect(activity.body.activity[0].actor.name).toBeTruthy();
    });

    it('includes a working invite link so a second person can join', async () => {
        const guest = await startDemo();

        const { rows } = await ownerPool().query<{ token: string }>(
            'SELECT token FROM invites',
        );

        expect(rows).toHaveLength(1);

        const second = await startDemo();

        const accepted = await request(app.getHttpServer())
            .post(`/invites/${rows[0].token}/accept`)
            .set('Cookie', second.cookie)
            .expect(200);

        expect(accepted.body.role).toBe('member');

        await request(app.getHttpServer())
            .get(`/boards/${guest.boardId}`)
            .set('Cookie', second.cookie)
            .expect(200);
    });

    it('keeps each guest isolated from every other guest', async () => {
        const first = await startDemo();
        const second = await startDemo();

        expect(second.boardId).not.toBe(first.boardId);

        await request(app.getHttpServer())
            .get(`/boards/${first.boardId}`)
            .set('Cookie', second.cookie)
            .expect(404);
    });
});

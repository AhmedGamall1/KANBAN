import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Socket } from 'socket.io-client';
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
import { connectSocket, joinBoard, once, watchForSilence } from './helpers/socket';


describe('revocation reaches the socket', () => {
    let app: INestApplication;
    let owner: TestUser;
    let member: TestUser;
    let workspaceId: string;
    let boardId: string;
    let columnId: string;
    let sockets: Socket[];

    beforeAll(async () => {
        app = await createTestApp({ listen: true });
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        sockets = [];

        await truncateAll();

        owner = await signUp(app, 'Amira');
        member = await signUp(app, 'Bilal');

        const workspace = await createWorkspace(app, owner.cookie);
        workspaceId = workspace.id;

        const board = await createBoard(app, owner.cookie, workspaceId);
        boardId = board.id;

        const column = await createColumn(app, owner.cookie, boardId);
        columnId = column.id;

        await joinWorkspace(app, owner.cookie, workspaceId, member.cookie);
    });

    afterEach(() => {
        for (const socket of sockets) {
            socket.disconnect();
        }
    });

    async function watchingMember(): Promise<Socket> {
        const socket = await connectSocket(app, member.cookie);

        sockets.push(socket);

        await joinBoard(socket, boardId);

        return socket;
    }

    function ownerAddsCard(title: string): Promise<unknown> {
        return createCard(app, owner.cookie, boardId, columnId, title);
    }

    it('delivers board events to a member who is watching', async () => {
        const socket = await watchingMember();
        const event = once<{ type: string }>(socket, 'board:event');

        await ownerAddsCard('Visible');

        expect((await event).type).toBe('card_created');
    });

    it('stops delivering board events once the member is removed', async () => {
        const socket = await watchingMember();
        const settle = watchForSilence(socket, 'board:event');

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/members/${member.id}`)
            .set('Cookie', owner.cookie)
            .expect(204);

        await ownerAddsCard('Secret');

        await settle();
    });

    it('tells the removed member why', async () => {
        const socket = await watchingMember();
        const revoked = once<{ reason: string }>(socket, 'board:revoked');

        await request(app.getHttpServer())
            .delete(`/workspaces/${workspaceId}/members/${member.id}`)
            .set('Cookie', owner.cookie)
            .expect(204);

        expect((await revoked).reason).toBe('removed');
    });

    it('keeps a demoted member connected but tells them the new role', async () => {
        const socket = await watchingMember();
        const changed = once<{ role: string }>(socket, 'board:role');

        await request(app.getHttpServer())
            .patch(`/workspaces/${workspaceId}/members/${member.id}`)
            .set('Cookie', owner.cookie)
            .send({ role: 'viewer' })
            .expect(200);

        expect((await changed).role).toBe('viewer');

        const event = once<{ type: string }>(socket, 'board:event');

        await ownerAddsCard('Still readable');

        expect((await event).type).toBe('card_created');
    });
});
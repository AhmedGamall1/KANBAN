import type { INestApplication } from '@nestjs/common';
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
import {
    connectExpectingFailure,
    connectSocket,
    joinBoard,
    once,
    watchForSilence,
} from './helpers/socket';

interface BoardState {
    boardId: string;
    role: string;
    seq: string;
    presence: { id: string; name: string }[];
    missed: { type: string }[];
    resyncRequired: boolean;
}

interface Presence {
    users: { id: string; name: string }[];
}

describe('realtime gateway', () => {
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

    async function connect(user: TestUser): Promise<Socket> {
        const socket = await connectSocket(app, user.cookie);

        sockets.push(socket);

        return socket;
    }

    it('refuses a handshake with no session cookie', async () => {
        await expect(connectExpectingFailure(app)).resolves.toBe('Unauthorized');
    });

    it('gives a joining member their role, sequence and presence', async () => {
        const socket = await connect(member);
        const state = await joinBoard<BoardState>(socket, boardId);

        expect(state.boardId).toBe(boardId);
        expect(state.role).toBe('member');
        expect(Number(state.seq)).toBeGreaterThan(0);
        expect(state.presence.map((user) => user.id)).toEqual([member.id]);
        expect(state.resyncRequired).toBe(false);
    });

    it('rejects a join with a malformed board id', async () => {
        const socket = await connect(member);
        const failure = once<{ message: string }>(socket, 'board:error');

        socket.emit('board:join', { boardId: 'not-a-uuid' });

        expect((await failure).message).toContain('uuid');
    });

    it('rejects a join for a board the user cannot see', async () => {
        const outsider = await signUp(app, 'Carla');
        const socket = await connect(outsider);
        const failure = once<{ message: string }>(socket, 'board:error');

        socket.emit('board:join', { boardId });

        expect((await failure).message).toBe('Board not found');
    });

    it('announces a second member to those already on the board', async () => {
        const first = await connect(owner);

        await joinBoard(first, boardId);

        const announced = once<Presence>(first, 'presence:update');
        const second = await connect(member);

        await joinBoard(second, boardId);

        const ids = (await announced).users.map((user) => user.id);

        expect(new Set(ids)).toEqual(new Set([owner.id, member.id]));
    });

    it('drops a member from presence when they leave', async () => {
        const watcher = await connect(owner);

        await joinBoard(watcher, boardId);

        const leaver = await connect(member);

        await joinBoard(leaver, boardId);
        await once(watcher, 'presence:update');

        const dropped = once<Presence>(watcher, 'presence:update');

        leaver.emit('board:leave');

        expect((await dropped).users.map((user) => user.id)).toEqual([owner.id]);
    });

    it('drops a member from presence when they disconnect', async () => {
        const watcher = await connect(owner);

        await joinBoard(watcher, boardId);

        const leaver = await connect(member);

        await joinBoard(leaver, boardId);
        await once(watcher, 'presence:update');

        const dropped = once<Presence>(watcher, 'presence:update');

        leaver.disconnect();

        expect((await dropped).users.map((user) => user.id)).toEqual([owner.id]);
    });

    it('leaves the previous board when joining another', async () => {
        const watcher = await connect(owner);

        await joinBoard(watcher, boardId);

        const other = await createBoard(app, owner.cookie, workspaceId, 'Second');
        const wanderer = await connect(member);

        await joinBoard(wanderer, boardId);
        await once(watcher, 'presence:update');

        const dropped = once<Presence>(watcher, 'presence:update');

        await joinBoard(wanderer, other.id);

        expect((await dropped).users.map((user) => user.id)).toEqual([owner.id]);
    });

    it('relays a cursor to others but not back to the sender', async () => {
        const sender = await connect(owner);
        const watcher = await connect(member);

        await joinBoard(sender, boardId);
        await joinBoard(watcher, boardId);

        const relayed = once<{ userId: string; x: number; y: number }>(
            watcher,
            'cursor:update',
        );
        const senderSilence = watchForSilence(sender, 'cursor:update');

        sender.emit('cursor:move', { x: 0.25, y: 0.75 });

        const cursor = await relayed;

        expect(cursor.userId).toBe(owner.id);
        expect(cursor.x).toBeCloseTo(0.25);

        await senderSilence();
    });

    it('ignores a cursor outside the unit square', async () => {
        const sender = await connect(owner);
        const watcher = await connect(member);

        await joinBoard(sender, boardId);
        await joinBoard(watcher, boardId);

        const silence = watchForSilence(watcher, 'cursor:update');

        sender.emit('cursor:move', { x: 4, y: -2 });

        await silence();
    });

    it('relays an editing marker and clears it when the editor disconnects', async () => {
        const card = await createCard(app, owner.cookie, boardId, columnId, 'Draft');
        const editor = await connect(owner);
        const watcher = await connect(member);

        await joinBoard(editor, boardId);
        await joinBoard(watcher, boardId);

        const started = once<{ cardId: string; editing: boolean }>(
            watcher,
            'card:editing',
        );

        editor.emit('card:editing', { cardId: card.id, editing: true });

        expect(await started).toMatchObject({ cardId: card.id, editing: true });

        const cleared = once<{ cardId: string; editing: boolean }>(
            watcher,
            'card:editing',
        );

        editor.disconnect();

        expect(await cleared).toMatchObject({ cardId: card.id, editing: false });
    });

    it('replays events missed while away', async () => {
        const first = await connect(member);
        const before = await joinBoard<BoardState>(first, boardId);

        first.disconnect();

        await createCard(app, owner.cookie, boardId, columnId, 'While away');

        const second = await connect(member);
        const after = await joinBoard<BoardState>(second, boardId, before.seq);

        expect(after.resyncRequired).toBe(false);
        expect(after.missed.map((event) => event.type)).toEqual(['card_created']);
    });
});

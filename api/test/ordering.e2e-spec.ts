import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
    closeHarness,
    createBoard,
    createCard,
    createColumn,
    createTestApp,
    createWorkspace,
    signUp,
    truncateAll,
    type TestUser,
} from './helpers/harness';

describe('concurrent ordering', () => {
    let app: INestApplication;
    let user: TestUser;
    let boardId: string;
    let columnId: string;

    beforeAll(async () => {
        app = await createTestApp();
    });

    afterAll(async () => {
        await app.close();
        await closeHarness();
    });

    beforeEach(async () => {
        await truncateAll();

        user = await signUp(app, 'Amira');

        const workspace = await createWorkspace(app, user.cookie);
        const board = await createBoard(app, user.cookie, workspace.id);
        const column = await createColumn(app, user.cookie, board.id);

        boardId = board.id;
        columnId = column.id;
    });

    async function board(): Promise<{
        cards: { position: string; title: string }[];
        columns: { position: string }[];
    }> {
        const response = await request(app.getHttpServer())
            .get(`/boards/${boardId}`)
            .set('Cookie', user.cookie)
            .expect(200);

        return response.body;
    }

    function expectDistinct(positions: string[]): void {
        expect(new Set(positions).size).toBe(positions.length);
    }

    async function cardTitles(): Promise<string[]> {
        return (await board()).cards.map((card) => card.title);
    }

    function moveCard(
        cardId: string,
        prevCardId: string | null,
        nextCardId: string | null,
    ) {
        return request(app.getHttpServer())
            .patch(`/cards/${cardId}/position`)
            .set('Cookie', user.cookie)
            .send({ columnId, prevCardId, nextCardId })
            .expect(200);
    }

    it('moves a card to the top of its column', async () => {
        const a = await createCard(app, user.cookie, boardId, columnId, 'A');
        await createCard(app, user.cookie, boardId, columnId, 'B');
        const c = await createCard(app, user.cookie, boardId, columnId, 'C');

        await moveCard(c.id, null, a.id);

        expect(await cardTitles()).toEqual(['C', 'A', 'B']);
    });

    it('moves a card to the bottom of its column', async () => {
        const a = await createCard(app, user.cookie, boardId, columnId, 'A');
        await createCard(app, user.cookie, boardId, columnId, 'B');
        const c = await createCard(app, user.cookie, boardId, columnId, 'C');

        await moveCard(a.id, c.id, null);

        expect(await cardTitles()).toEqual(['B', 'C', 'A']);
    });

    it('moves a card between two neighbours', async () => {
        const a = await createCard(app, user.cookie, boardId, columnId, 'A');
        const b = await createCard(app, user.cookie, boardId, columnId, 'B');
        const c = await createCard(app, user.cookie, boardId, columnId, 'C');

        await moveCard(c.id, a.id, b.id);

        expect(await cardTitles()).toEqual(['A', 'C', 'B']);
    });

    it('gives distinct positions to cards dropped into the same gap at once', async () => {
        const low = await createCard(app, user.cookie, boardId, columnId, 'Low');
        const high = await createCard(app, user.cookie, boardId, columnId, 'High');

        const movers = await Promise.all([
            createCard(app, user.cookie, boardId, columnId, 'Mover A'),
            createCard(app, user.cookie, boardId, columnId, 'Mover B'),
            createCard(app, user.cookie, boardId, columnId, 'Mover C'),
        ]);

        await Promise.all(
            movers.map((mover) =>
                request(app.getHttpServer())
                    .patch(`/cards/${mover.id}/position`)
                    .set('Cookie', user.cookie)
                    .send({ columnId, prevCardId: low.id, nextCardId: high.id })
                    .expect(200),
            ),
        );

        const titles = await cardTitles();

        expectDistinct((await board()).cards.map((card) => card.position));
        expect(titles[0]).toBe('Low');
        expect(titles[titles.length - 1]).toBe('High');
    });

    it('gives distinct positions to cards created at once', async () => {
        await Promise.all([
            createCard(app, user.cookie, boardId, columnId, 'One'),
            createCard(app, user.cookie, boardId, columnId, 'Two'),
            createCard(app, user.cookie, boardId, columnId, 'Three'),
        ]);

        expectDistinct((await board()).cards.map((card) => card.position));
    });

    it('gives distinct positions to columns dropped into the same gap at once', async () => {
        const low = await createColumn(app, user.cookie, boardId, 'Low');
        const high = await createColumn(app, user.cookie, boardId, 'High');

        const movers = await Promise.all([
            createColumn(app, user.cookie, boardId, 'Mover A'),
            createColumn(app, user.cookie, boardId, 'Mover B'),
        ]);

        await Promise.all(
            movers.map((mover) =>
                request(app.getHttpServer())
                    .patch(`/columns/${mover.id}`)
                    .set('Cookie', user.cookie)
                    .send({ move: { prevColumnId: low.id, nextColumnId: high.id } })
                    .expect(200),
            ),
        );

        expectDistinct((await board()).columns.map((column) => column.position));
    });
});

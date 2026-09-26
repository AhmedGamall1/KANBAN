import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApp } from 'src/bootstrap';
import { NestExpressApplication } from '@nestjs/platform-express';

const TABLES = [
    'board_events',
    'cards',
    'columns',
    'boards',
    'invites',
    'workspace_members',
    'workspaces',
    'user_identities',
    'sessions',
    'users',
];

let owner: Pool | undefined;

export function ownerPool(): Pool {
    owner ??= new Pool({ connectionString: process.env.MIGRATION_DATABASE_URL });

    return owner;
}

export async function createTestApp(
    options: { listen?: boolean } = {},
): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();

    app.use(cookieParser());

    if (options.listen) {
        await app.listen(0, '127.0.0.1');
    } else {
        await app.init();
    }

    return app;
}

export async function truncateAll(): Promise<void> {
    await ownerPool().query(
        `TRUNCATE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`,
    );
}

export async function closeHarness(): Promise<void> {
    await owner?.end();
    owner = undefined;
}

export interface TestUser {
    id: string;
    email: string;
    name: string;
    cookie: string;
}

let sequence = 0;

export async function signUp(
    app: INestApplication,
    name = 'Test User',
): Promise<TestUser> {
    sequence += 1;

    const email = `user${sequence}.${Date.now()}@example.com`;

    const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, password: 'correct-horse-battery', name })
        .expect(201);

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const sid = cookies?.find((value) => value.startsWith('sid='));

    if (!sid) {
        throw new Error('signup did not set a session cookie');
    }

    return { id: response.body.user.id, email, name, cookie: sid.split(';')[0] };
}

export async function createWorkspace(
    app: INestApplication,
    cookie: string,
    name = 'Test Workspace',
): Promise<{ id: string }> {
    const response = await request(app.getHttpServer())
        .post('/workspaces')
        .set('Cookie', cookie)
        .send({ name })
        .expect(201);

    return { id: response.body.workspace.id };
}

export async function createBoard(
    app: INestApplication,
    cookie: string,
    workspaceId: string,
    name = 'Test Board',
): Promise<{ id: string }> {
    const response = await request(app.getHttpServer())
        .post(`/workspaces/${workspaceId}/boards`)
        .set('Cookie', cookie)
        .send({ name })
        .expect(201);

    return { id: response.body.board.id };
}


export async function createColumn(
    app: INestApplication,
    cookie: string,
    boardId: string,
    name = 'To do',
): Promise<{ id: string }> {
    const response = await request(app.getHttpServer())
        .post(`/boards/${boardId}/columns`)
        .set('Cookie', cookie)
        .send({ name })
        .expect(201);

    return { id: response.body.column.id };
}

export async function createCard(
    app: INestApplication,
    cookie: string,
    boardId: string,
    columnId: string,
    title = 'First card',
): Promise<{ id: string }> {
    const response = await request(app.getHttpServer())
        .post(`/boards/${boardId}/cards`)
        .set('Cookie', cookie)
        .send({ columnId, title })
        .expect(201);

    return { id: response.body.card.id };
}

export async function joinWorkspace(
    app: INestApplication,
    ownerCookie: string,
    workspaceId: string,
    joinerCookie: string,
): Promise<void> {
    const invite = await request(app.getHttpServer())
        .post(`/workspaces/${workspaceId}/invite-link`)
        .set('Cookie', ownerCookie)
        .expect(200);

    await request(app.getHttpServer())
        .post(`/invites/${invite.body.invite.token}/accept`)
        .set('Cookie', joinerCookie)
        .expect(200);
}

export async function createProductionApp(
    clientDir: string,
): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication<NestExpressApplication>();

    configureApp(app, { clientDir });

    await app.init();

    return app;
}
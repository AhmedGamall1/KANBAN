import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { AuthService } from '../auth/auth.service';
import { BoardsRepository } from '../boards/boards.repository';
import { CardsRepository, type CardLabel } from '../cards/cards.repository';
import { ColumnsRepository } from '../columns/columns.repository';
import type { Env } from '../config/env.validation';
import { DatabaseService, type Queryable } from '../database/database.service';
import { EventsService } from '../events/events.service';
import { UsersRepository, type User } from '../users/users.repository';
import { InvitesRepository } from '../workspaces/invites.repository';
import { MembersRepository, type Role } from '../workspaces/members.repository';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';

const AVATAR_COLORS = [
    '#4f46e5',
    '#e11d48',
    '#0891b2',
    '#d97706',
    '#65a30d',
    '#c026d3',
];

const TEAMMATES: { name: string; role: Role }[] = [
    { name: 'Amira Nasser', role: 'member' },
    { name: 'Youssef Adel', role: 'member' },
    { name: 'Lina Farouk', role: 'viewer' },
];

interface SeedCard {
    title: string;
    description: string;
    label?: CardLabel;
    assignee?: number;
    moved?: boolean;
}

export interface DemoSession {
    user: User;
    boardId: string;
    token: string;
}

@Injectable()
export class DemoService {
    constructor(
        private readonly db: DatabaseService,
        private readonly config: ConfigService<Env, true>,
        private readonly auth: AuthService,
        private readonly users: UsersRepository,
        private readonly workspaces: WorkspacesRepository,
        private readonly members: MembersRepository,
        private readonly invites: InvitesRepository,
        private readonly boards: BoardsRepository,
        private readonly columns: ColumnsRepository,
        private readonly cards: CardsRepository,
        private readonly events: EventsService,
    ) { }

    async create(): Promise<DemoSession> {
        const suffix = randomBytes(6).toString('hex');

        const guest = await this.users.createGuest({
            email: `guest.${suffix}@demo.invalid`,
            name: 'Demo Guest',
            avatarColor: AVATAR_COLORS[0],
        });

        const boardId = await this.db.withUser(guest.id, (tx) =>
            this.seed(guest, suffix, tx),
        );

        return { user: guest, boardId, token: await this.auth.createSession(guest.id) };
    }

    private async seed(
        guest: User,
        suffix: string,
        tx: Queryable,
    ): Promise<string> {
        const workspaceId = await this.workspaces.nextId(tx);

        await this.workspaces.insert({ id: workspaceId, name: 'Acme Product', isDemo: true }, tx);
        await this.members.add(
            { workspaceId, userId: guest.id, role: 'owner' },
            tx,
        );

        const teammates = await this.addTeammates(workspaceId, suffix, tx);

        const board = await this.boards.create(
            { workspaceId, name: 'Sprint 12' },
            tx,
        );

        const invite = await this.invites.create(
            {
                workspaceId,
                createdBy: guest.id,
                token: randomBytes(32).toString('base64url'),
            },
            tx,
        );

        await this.events.record(
            {
                boardId: board.id,
                actorId: guest.id,
                type: 'board_created',
                payload: { board },
            },
            tx,
        );

        const origin = this.config.get('WEB_ORIGIN', { infer: true });
        const joinUrl = `${origin}/invite/${invite.token}`;

        const plan: { name: string; cards: SeedCard[] }[] = [
            { name: 'Start here', cards: this.tourCards(joinUrl) },
            {
                name: 'In progress',
                cards: [
                    {
                        title: 'Rate limit the guest demo endpoint',
                        description:
                            'It creates rows and it is public, so it needs a per-IP throttle.',
                        label: 'infra',
                        assignee: 0,
                    },
                    {
                        title: 'Column drag misbehaves on narrow screens',
                        description:
                            'The board is desktop-first by design, but the drag target should still be reachable.',
                        label: 'bug',
                        assignee: 1,
                    },
                ],
            },
            {
                name: 'In review',
                cards: [
                    {
                        title: 'Integration tests for row-level security',
                        description:
                            'A non-member must get zero rows, not a 403 — asserted against a real Postgres.',
                        label: 'db',
                        assignee: 0,
                    },
                ],
            },
            {
                name: 'Done',
                cards: [
                    {
                        title: 'Serve the web build behind the API',
                        description:
                            'One origin keeps the session cookie and the socket working with no CORS at all.',
                        label: 'infra',
                        assignee: 1,
                        moved: true,
                    },
                    {
                        title: 'Eject removed members from board sockets',
                        description:
                            'Removing someone now closes their live connection instead of leaving it subscribed.',
                        label: 'bug',
                        assignee: 0,
                        moved: true,
                    },
                ],
            },
        ];

        for (const [index, column] of plan.entries()) {
            const created = await this.columns.create(
                { boardId: board.id, name: column.name, position: String(index + 1) },
                tx,
            );

            await this.events.record(
                {
                    boardId: board.id,
                    actorId: guest.id,
                    type: 'column_created',
                    payload: { column: created },
                },
                tx,
            );

            for (const [position, card] of column.cards.entries()) {
                await this.addCard(
                    board.id,
                    created.id,
                    position + 1,
                    card,
                    guest,
                    teammates,
                    tx,
                );
            }
        }

        return board.id;
    }

    private tourCards(joinUrl: string): SeedCard[] {
        return [
            {
                title: 'Drag this card to In progress',
                description:
                    'Positions are fractional numerics, so a drop rewrites one row instead of renumbering the whole column.',
            },
            {
                title: 'Open this card to see the detail panel',
                description:
                    'Assign a teammate, set a label, and read the activity feed at the bottom. It is built from the same append-only event log that powers live updates.',
            },
            {
                title: 'Open this board in a second browser tab',
                description:
                    'Move a card in one tab and watch it move in the other. Your cursor is broadcast too, so you will see it in both.',
            },
            {
                title: 'Invite a second person to see presence',
                description: `Open this link in a private window to join as a different person, then watch the avatars in the board header:\n\n${joinUrl}`,
            },
            {
                title: 'Check the Members page in the sidebar',
                description:
                    'Three roles — owner, member and viewer — enforced by Postgres row-level security rather than hidden in the UI. You are the owner of this workspace.',
            },
        ];
    }

    private async addTeammates(
        workspaceId: string,
        suffix: string,
        tx: Queryable,
    ): Promise<User[]> {
        const created: User[] = [];

        for (const [index, teammate] of TEAMMATES.entries()) {
            const handle = teammate.name.split(' ')[0].toLowerCase();

            const user = await this.users.createGuest(
                {
                    email: `${handle}.${suffix}@demo.invalid`,
                    name: teammate.name,
                    avatarColor: AVATAR_COLORS[(index + 1) % AVATAR_COLORS.length],
                },
                tx,
            );

            await this.members.add(
                { workspaceId, userId: user.id, role: teammate.role },
                tx,
            );

            created.push(user);
        }

        return created;
    }

    private async addCard(
        boardId: string,
        columnId: string,
        position: number,
        seed: SeedCard,
        guest: User,
        teammates: User[],
        tx: Queryable,
    ): Promise<void> {
        const assignee =
            seed.assignee === undefined ? undefined : teammates[seed.assignee];

        const created = await this.cards.create(
            { boardId, columnId, title: seed.title, position: String(position) },
            tx,
        );

        if (!created) {
            throw new InternalServerErrorException('Demo card not created');
        }

        const card = await this.cards.update(
            created.id,
            {
                description: seed.description,
                label: seed.label ?? null,
                assigneeId: assignee?.id ?? null,
            },
            tx,
        );

        const actorId = assignee?.id ?? guest.id;

        await this.events.record(
            {
                boardId,
                actorId,
                type: 'card_created',
                payload: { cardId: created.id, card: card ?? created },
            },
            tx,
        );

        if (seed.moved) {
            await this.events.record(
                {
                    boardId,
                    actorId,
                    type: 'card_moved',
                    payload: { cardId: created.id, columnId, position: String(position) },
                },
                tx,
            );
        }
    }
}

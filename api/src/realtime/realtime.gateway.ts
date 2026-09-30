import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { parseCookie } from 'cookie';
import type { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import type { User } from '../users/users.repository';
import { MessageBody, ConnectedSocket, SubscribeMessage } from '@nestjs/websockets';
import { z } from 'zod';
import { AccessRepository } from '../access/access.repository';
import { DatabaseService } from '../database/database.service';
import { EventsService } from '../events/events.service';
import { OnEvent } from '@nestjs/event-emitter';
import type { BoardEvent } from '../events/events.repository';
import { BoardsRepository } from '../boards/boards.repository';
import {
    MEMBER_REMOVED,
    MEMBER_ROLE_CHANGED,
    type MemberRemovedEvent,
    type MemberRoleChangedEvent,
} from '../workspaces/member-events';


export interface SocketData {
    user: User;
    boardId?: string;
    workspaceId?: string;
    editingCardId?: string;
}

export interface PresenceUser {
    id: string;
    name: string;
    avatarColor: string;
    avatarUrl: string | null
}

const boardRoom = (boardId: string): string => `board:${boardId}`;

const joinSchema = z.object({
    boardId: z.uuid(),
    after: z.string().regex(/^\d+$/).optional(),
});

const cursorSchema = z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
});

const editingSchema = z.object({
    cardId: z.uuid(),
    editing: z.boolean(),
});

export type AppSocket = Socket & { data: SocketData };

@WebSocketGateway()
export class RealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(RealtimeGateway.name);

    // make the server instance avaliable inside the class
    @WebSocketServer()
    server!: Server;

    constructor(
        private readonly auth: AuthService,
        private readonly access: AccessRepository,
        private readonly events: EventsService,
        private readonly db: DatabaseService,
        private readonly boards: BoardsRepository,
        private readonly config: ConfigService<Env, true>,
    ) { }

    afterInit(server: Server): void {
        const allowedOrigin = new URL(
            this.config.get('WEB_ORIGIN', { infer: true }),
        ).origin;

        // every connection need to pass this middleware to open
        server.use((socket, next) => {
            const origin = socket.handshake.headers.origin;

            if (origin && origin !== allowedOrigin) {
                next(new Error('Origin not allowed'));
                return;
            }

            this.authenticate(socket as AppSocket).then(
                () => next(),
                () => next(new Error('Unauthorized')),
            );
        });

        this.logger.log('Socket gateway ready');
    }

    handleConnection(socket: AppSocket): void {
        this.logger.log(`Connected: ${socket.data.user.name} (${socket.id})`);
    }

    async handleDisconnect(socket: AppSocket): Promise<void> {
        const { boardId, user } = socket.data;

        this.logger.log(`Disconnected: ${user?.name ?? 'unknown'} (${socket.id})`);

        if (boardId) {
            this.clearEditing(socket);
            await this.broadcastPresence(boardId);
        }
    }

    private async authenticate(socket: AppSocket): Promise<void> {
        const header = socket.handshake.headers.cookie;
        const token = header ? parseCookie(header)['sid'] : undefined;
        if (!token) {
            throw new Error('No session cookie');
        }

        const user = await this.auth.validateSession(token);

        if (!user) {
            throw new Error('Invalid session');
        }

        socket.data.user = user;
    }


    private async presenceFor(boardId: string): Promise<PresenceUser[]> {
        const sockets = await this.server.in(boardRoom(boardId)).fetchSockets();
        const byUser = new Map<string, PresenceUser>();

        for (const other of sockets) {
            const { user } = other.data as SocketData;

            if (user) {
                byUser.set(user.id, {
                    id: user.id,
                    name: user.name,
                    avatarColor: user.avatarColor,
                    avatarUrl: user.avatarUrl,
                });
            }
        }

        return [...byUser.values()];
    }

    private async broadcastPresence(boardId: string): Promise<void> {
        this.server.to(boardRoom(boardId)).emit('presence:update', {
            users: await this.presenceFor(boardId),
        });
    }

    private clearEditing(socket: AppSocket): void {
        const { boardId, user, editingCardId } = socket.data;

        if (!boardId || !editingCardId) {
            return;
        }

        this.server.to(boardRoom(boardId)).emit('card:editing', {
            cardId: editingCardId,
            userId: user.id,
            editing: false,
        });

        socket.data.editingCardId = undefined;
    }

    @SubscribeMessage('board:join')
    async handleJoin(
        @ConnectedSocket() socket: AppSocket,
        @MessageBody() body: unknown,
    ): Promise<void> {
        const parsed = joinSchema.safeParse(body);

        if (!parsed.success) {
            socket.emit('board:error', { message: 'boardId must be a uuid' });
            return;
        }

        const { boardId } = parsed.data;
        const userId = socket.data.user.id;

        const role = await this.access.roleFor('board', boardId, userId);

        if (!role) {
            socket.emit('board:error', { message: 'Board not found' });
            return;
        }

        const state = await this.db.withUser(userId, async () => ({
            board: await this.boards.findById(boardId),
            seq: await this.events.currentSeq(boardId),
            catchUp: parsed.data.after
                ? await this.events.since(boardId, parsed.data.after)
                : null,
        }));

        if (!state.board) {
            socket.emit('board:error', { message: 'Board not found' });
            return;
        }

        const previousBoardId = socket.data.boardId;

        if (previousBoardId && previousBoardId !== boardId) {
            this.clearEditing(socket);
            await socket.leave(boardRoom(previousBoardId));
        }

        await socket.join(boardRoom(boardId));
        socket.data.boardId = boardId;
        socket.data.workspaceId = state.board.workspaceId;

        socket.emit('board:state', {
            boardId,
            role,
            seq: state.seq,
            presence: await this.presenceFor(boardId),
            missed: state.catchUp?.hasMore ? [] : (state.catchUp?.events ?? []),
            resyncRequired: state.catchUp?.hasMore ?? false,
        });

        socket
            .to(boardRoom(boardId))
            .emit('presence:update', { users: await this.presenceFor(boardId) });

        if (previousBoardId && previousBoardId !== boardId) {
            await this.broadcastPresence(previousBoardId);
        }

        this.logger.log(`${socket.data.user.name} joined ${boardRoom(boardId)}`);
    }

    @SubscribeMessage('board:leave')
    async handleLeave(@ConnectedSocket() socket: AppSocket): Promise<void> {
        const { boardId } = socket.data;

        if (!boardId) {
            return;
        }

        await socket.leave(boardRoom(boardId));
        socket.data.boardId = undefined;
        socket.data.workspaceId = undefined;

        this.clearEditing(socket);

        await this.broadcastPresence(boardId);

        this.logger.log(`${socket.data.user.name} left ${boardRoom(boardId)}`);
    }

    private socketsFor(workspaceId: string, userId: string): AppSocket[] {
        const matches: AppSocket[] = [];

        for (const socket of this.server.sockets.sockets.values()) {
            const data = (socket as AppSocket).data;

            if (data.user?.id === userId && data.workspaceId === workspaceId) {
                matches.push(socket as AppSocket);
            }
        }

        return matches;
    }

    @OnEvent(MEMBER_REMOVED)
    async handleMemberRemoved(payload: MemberRemovedEvent): Promise<void> {
        const affected = this.socketsFor(payload.workspaceId, payload.userId);
        const boards = new Set<string>();

        for (const socket of affected) {
            if (socket.data.boardId) {
                boards.add(socket.data.boardId);
                await socket.leave(boardRoom(socket.data.boardId));
            }

            socket.data.boardId = undefined;
            socket.data.workspaceId = undefined;
            socket.data.editingCardId = undefined;

            socket.emit('board:revoked', { reason: 'removed' });
        }

        for (const boardId of boards) {
            await this.broadcastPresence(boardId);
        }
    }

    @OnEvent(MEMBER_ROLE_CHANGED)
    handleMemberRoleChanged(payload: MemberRoleChangedEvent): void {
        for (const socket of this.socketsFor(payload.workspaceId, payload.userId)) {
            socket.emit('board:role', { role: payload.role });
        }
    }

    @OnEvent('board.event')
    broadcast(event: BoardEvent): void {
        this.server.to(boardRoom(event.boardId)).emit('board:event', event);
    }

    @SubscribeMessage('cursor:move')
    handleCursor(
        @ConnectedSocket() socket: AppSocket,
        @MessageBody() body: unknown,
    ): void {
        const { boardId, user } = socket.data;

        if (!boardId) {
            return;
        }

        const parsed = cursorSchema.safeParse(body);

        if (!parsed.success) {
            return;
        }

        socket.to(boardRoom(boardId)).volatile.emit('cursor:update', {
            userId: user.id,
            x: parsed.data.x,
            y: parsed.data.y,
        });
    }

    @SubscribeMessage('card:editing')
    handleEditing(
        @ConnectedSocket() socket: AppSocket,
        @MessageBody() body: unknown,
    ): void {
        const { boardId, user } = socket.data;

        if (!boardId) {
            return;
        }

        const parsed = editingSchema.safeParse(body);

        if (!parsed.success) {
            socket.emit('board:error', { message: 'cardId must be a uuid' });
            return;
        }

        const { cardId, editing } = parsed.data;

        socket.data.editingCardId = editing ? cardId : undefined;

        socket.to(boardRoom(boardId)).emit('card:editing', {
            cardId,
            userId: user.id,
            editing,
        });
    }
}
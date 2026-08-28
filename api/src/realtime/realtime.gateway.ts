import { Logger } from '@nestjs/common';
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

export interface SocketData {
    user: User;
    boardId?: string;
    editingCardId?: string;
}

export interface PresenceUser {
    id: string;
    name: string;
    avatarColor: string;
}

const boardRoom = (boardId: string): string => `board:${boardId}`;

const joinSchema = z.object({ boardId: z.uuid() });

const cursorSchema = z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
});

const editingSchema = z.object({
    cardId: z.uuid(),
    editing: z.boolean(),
});

export type AppSocket = Socket & { data: SocketData };

@WebSocketGateway({ cors: { origin: true, credentials: true } })
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
    ) { }

    afterInit(server: Server): void {
        // every connection need to pass this middleware to open
        server.use((socket, next) => {
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

        if (socket.data.boardId && socket.data.boardId !== boardId) {
            await socket.leave(boardRoom(socket.data.boardId));
        }

        await socket.join(boardRoom(boardId));
        socket.data.boardId = boardId;

        const seq = await this.db.withUser(userId, () =>
            this.events.currentSeq(boardId),
        );

        socket.emit('board:state', {
            boardId,
            role,
            seq,
            presence: await this.presenceFor(boardId),
        });

        socket
            .to(boardRoom(boardId))
            .emit('presence:update', { users: await this.presenceFor(boardId) });

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

        this.clearEditing(socket);

        await this.broadcastPresence(boardId);

        this.logger.log(`${socket.data.user.name} left ${boardRoom(boardId)}`);
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
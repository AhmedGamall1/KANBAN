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
}

const boardRoom = (boardId: string): string => `board:${boardId}`;

const joinSchema = z.object({ boardId: z.uuid() });

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

    handleDisconnect(socket: AppSocket): void {
        this.logger.log(
            `Disconnected: ${socket.data.user?.name ?? 'unknown'} (${socket.id})`,
        );
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

        socket.emit('board:state', { boardId, role, seq, presence: [] });

        this.logger.log(`${socket.data.user.name} joined ${boardRoom(boardId)}`);
    }

    @SubscribeMessage('board:leave')
    async handleLeave(@ConnectedSocket() socket: AppSocket): Promise<void> {
        if (!socket.data.boardId) {
            return;
        }

        await socket.leave(boardRoom(socket.data.boardId));
        this.logger.log(`${socket.data.user.name} left ${boardRoom(socket.data.boardId)}`);
        socket.data.boardId = undefined;
    }

    @OnEvent('board.event')
    broadcast(event: BoardEvent): void {
        this.server.to(boardRoom(event.boardId)).emit('board:event', event);
    }
}
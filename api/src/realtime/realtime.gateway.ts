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

export interface SocketData {
    user: User;
}

export type AppSocket = Socket & { data: SocketData };

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(RealtimeGateway.name);

    // make the server instance avaliable inside the class
    @WebSocketServer()
    server!: Server;

    constructor(private readonly auth: AuthService) { }

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
}
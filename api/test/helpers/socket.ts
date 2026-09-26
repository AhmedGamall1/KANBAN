import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { io, type Socket } from 'socket.io-client';

export function serverUrl(app: INestApplication): string {
    const address = app.getHttpServer().address() as AddressInfo;

    return `http://127.0.0.1:${address.port}`;
}

export async function connectSocket(
    app: INestApplication,
    cookie: string,
): Promise<Socket> {
    const socket = io(serverUrl(app), {
        extraHeaders: { Cookie: cookie },
        transports: ['websocket'],
        reconnection: false,
    });

    await once(socket, 'connect');

    return socket;
}

export function once<T = unknown>(
    socket: Socket,
    event: string,
    timeoutMs = 4000,
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.off(event, handler);
            reject(new Error(`timed out waiting for "${event}"`));
        }, timeoutMs);

        function handler(payload: T): void {
            clearTimeout(timer);
            socket.off(event, handler);
            resolve(payload);
        }

        socket.on(event, handler);
    });
}

export function expectSilence(
    socket: Socket,
    event: string,
    windowMs = 800,
): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        function handler(payload: unknown): void {
            clearTimeout(timer);
            socket.off(event, handler);
            reject(new Error(`received "${event}" but expected none: ${JSON.stringify(payload)}`));
        }

        const timer = setTimeout(() => {
            socket.off(event, handler);
            resolve();
        }, windowMs);

        socket.on(event, handler);
    });
}

export async function joinBoard(socket: Socket, boardId: string): Promise<void> {
    const state = once(socket, 'board:state');

    socket.emit('board:join', { boardId });

    await state;
}
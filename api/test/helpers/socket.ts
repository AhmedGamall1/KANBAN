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

export function connectWithOrigin(
    app: INestApplication,
    cookie: string,
    origin: string,
): Promise<string> {
    const socket = io(serverUrl(app), {
        extraHeaders: { Cookie: cookie, Origin: origin },
        transports: ['websocket'],
        reconnection: false,
    });

    return new Promise<string>((resolve) => {
        const timer = setTimeout(() => {
            socket.disconnect();
            resolve('timeout');
        }, 4000);

        socket.on('connect', () => {
            clearTimeout(timer);
            socket.disconnect();
            resolve('connected');
        });

        socket.on('connect_error', (error: Error) => {
            clearTimeout(timer);
            socket.disconnect();
            resolve(error.message);
        });
    });
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

export function watchForSilence(
    socket: Socket,
    event: string,
    windowMs = 1000,
): () => Promise<void> {
    let received: unknown;

    function handler(payload: unknown): void {
        received ??= payload;
    }

    socket.on(event, handler);

    return async () => {
        await new Promise((resolve) => setTimeout(resolve, windowMs));

        socket.off(event, handler);

        if (received !== undefined) {
            throw new Error(
                `received "${event}" but expected none: ${JSON.stringify(received)}`,
            );
        }
    };
}

export async function joinBoard<T = unknown>(
    socket: Socket,
    boardId: string,
    after?: string,
): Promise<T> {
    const state = once<T>(socket, 'board:state');

    socket.emit('board:join', after ? { boardId, after } : { boardId });

    return state;
}

export function connectExpectingFailure(app: INestApplication): Promise<string> {
    const socket = io(serverUrl(app), {
        transports: ['websocket'],
        reconnection: false,
    });

    return new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => {
            socket.disconnect();
            reject(new Error('expected the handshake to fail'));
        }, 4000);

        socket.on('connect_error', (error: Error) => {
            clearTimeout(timer);
            socket.disconnect();
            resolve(error.message);
        });

        socket.on('connect', () => {
            clearTimeout(timer);
            socket.disconnect();
            reject(new Error('handshake succeeded without a cookie'));
        });
    });
}
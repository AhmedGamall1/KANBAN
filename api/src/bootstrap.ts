import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const API_PREFIX = 'api';

// return frontend dir path if html exist otherwise null
export function resolveClientDir(configured?: string): string | null {
    const candidate = configured
        ? resolve(process.cwd(), configured)
        : join(__dirname, 'client');

    return existsSync(join(candidate, 'index.html')) ? candidate : null;
}

export function configureApp(
    app: NestExpressApplication,
    options: { clientDir?: string | null } = {},
): void {
    app.use(cookieParser());
    app.setGlobalPrefix(API_PREFIX);

    const { clientDir } = options;

    if (!clientDir) {
        return;
    }

    app.useStaticAssets(clientDir, { index: false });

    app.use((request: Request, response: Response, next: NextFunction) => {
        if (
            request.method !== 'GET' ||
            request.path === `/${API_PREFIX}` ||
            request.path.startsWith(`/${API_PREFIX}/`) ||
            request.path.startsWith('/socket.io')
        ) {
            next();
            return;
        }

        response.sendFile(join(clientDir, 'index.html'));
    });
}
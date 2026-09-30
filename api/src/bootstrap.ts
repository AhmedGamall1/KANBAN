import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

export const API_PREFIX = 'api';

export function configureApp(
    app: NestExpressApplication,
    options: { trustProxy?: boolean } = {},
): void {
    if (options.trustProxy) {
        app.set('trust proxy', 1);
    }

    app.use(cookieParser());
    app.setGlobalPrefix(API_PREFIX);
}

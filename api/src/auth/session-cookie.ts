import type { CookieOptions } from 'express';
import { SESSION_TTL_DAYS } from './auth.service';

export const SESSION_COOKIE = 'sid';

export function sessionCookieOptions(production: boolean): CookieOptions {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: production,
        path: '/',
        maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    };
}

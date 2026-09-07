import type { CookieOptions } from 'express';
import { SESSION_TTL_DAYS } from './auth.service';

export function sessionCookieOptions(isProduction: boolean): CookieOptions {
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProduction,
        path: '/',
        maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
    };
}
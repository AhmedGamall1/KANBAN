import { Controller, Get, Logger, Param, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import type { CookieOptions, Request, Response } from 'express';
import { z } from 'zod';
import { Public } from '../../common/public.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import type { Env } from '../../config/env.validation';
import { OauthService, UnverifiedEmailError } from './oauth.service';
import type { Provider } from './oauth.providers';
import { sessionCookieOptions } from '../session-cookie';

const providerSchema = z.enum(['google', 'github']);

const STATE_COOKIE: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60 * 1000,
};

function safeNext(value: unknown): string {
    return typeof value === 'string' &&
        value.startsWith('/') &&
        !value.startsWith('//')
        ? value
        : '/workspaces';
}

@Controller('auth/oauth')
export class OauthController {
    private readonly logger = new Logger(OauthController.name);

    constructor(
        private readonly oauth: OauthService,
        private readonly config: ConfigService<Env, true>,
    ) { }

    private get origin(): string {
        return this.config.get('WEB_ORIGIN', { infer: true });
    }

    @Public()
    @Get(':provider')
    start(
        @Param('provider', new ZodValidationPipe(providerSchema)) provider: Provider,
        @Query('next') next: string | undefined,
        @Res() res: Response,
    ): void {
        const state = randomBytes(16).toString('base64url');

        res.cookie('oauth_state', state, STATE_COOKIE);
        res.cookie('oauth_next', safeNext(next), STATE_COOKIE);
        res.redirect(this.oauth.authorizationUrl(provider, state));
    }

    @Public()
    @Get(':provider/callback')
    async callback(
        @Param('provider', new ZodValidationPipe(providerSchema)) provider: Provider,
        @Query('code') code: string | undefined,
        @Query('state') state: string | undefined,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<void> {
        const expected = req.cookies?.['oauth_state'] as string | undefined;
        const next = safeNext(req.cookies?.['oauth_next']);

        res.clearCookie('oauth_state', { path: '/' });
        res.clearCookie('oauth_next', { path: '/' });

        if (!code || !state || !expected || state !== expected) {
            res.redirect(`${this.origin}/login?error=state`);
            return;
        }

        try {
            const token = await this.oauth.signIn(provider, code);

            res.cookie(
                'sid',
                token,
                sessionCookieOptions(
                    this.config.get('NODE_ENV', { infer: true }) === 'production',
                ),
            );
            res.redirect(`${this.origin}${next}`);
        } catch (error) {
            this.logger.warn(`${provider} sign in failed: ${String(error)}`);

            res.redirect(
                `${this.origin}/login?error=${error instanceof UnverifiedEmailError ? 'unverified_email' : 'failed'
                }`,
            );
        }
    }
}
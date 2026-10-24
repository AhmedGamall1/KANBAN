import { Controller, Headers, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
    SESSION_COOKIE,
    sessionCookieOptions,
} from '../auth/session-cookie';
import { Public } from '../common/public.decorator';
import type { Env } from '../config/env.validation';
import { DemoService } from './demo.service';
import { Throttle } from '@nestjs/throttler';
import { GUEST_THROTTLE } from '../common/throttle';
import { Notifier } from '../notifications/notifier.service';

@Controller('auth')
export class DemoController {
    constructor(
        private readonly demo: DemoService,
        private readonly config: ConfigService<Env, true>,
        private readonly notifier: Notifier,
    ) { }

    @Public()
    @Throttle({ default: GUEST_THROTTLE })
    @Post('guest')
    @HttpCode(HttpStatus.CREATED)
    async guest(
        @Res({ passthrough: true }) res: Response,
        @Headers('cf-ipcountry') country: string | undefined,
    ) {
        const { user, boardId, token } = await this.demo.create();

        res.cookie(
            SESSION_COOKIE,
            token,
            sessionCookieOptions(
                this.config.get('NODE_ENV', { infer: true }) === 'production',
            ),
        );

        void this.notifier.demoStarted(country);

        return { user, boardId };
    }
}

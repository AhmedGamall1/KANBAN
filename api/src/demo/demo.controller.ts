import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import {
    SESSION_COOKIE,
    sessionCookieOptions,
} from '../auth/session-cookie';
import { Public } from '../common/public.decorator';
import type { Env } from '../config/env.validation';
import { DemoService } from './demo.service';

@Controller('auth')
export class DemoController {
    constructor(
        private readonly demo: DemoService,
        private readonly config: ConfigService<Env, true>,
    ) { }

    @Public()
    @Post('guest')
    @HttpCode(HttpStatus.CREATED)
    async guest(@Res({ passthrough: true }) res: Response) {
        const { user, boardId, token } = await this.demo.create();

        res.cookie(
            SESSION_COOKIE,
            token,
            sessionCookieOptions(
                this.config.get('NODE_ENV', { infer: true }) === 'production',
            ),
        );

        return { user, boardId };
    }
}

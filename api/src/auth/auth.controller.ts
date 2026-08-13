import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { Env } from '../config/env.validation';
import { AuthService, SESSION_TTL_DAYS } from './auth.service';
import { loginSchema, type LoginDto } from './dto/login.dto';
import { signupSchema, type SignupDto } from './dto/signup.dto';
import { CurrentUser } from 'src/common/current-user.decorator';
import type { User } from 'src/users/users.repository';
import { Public } from 'src/common/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly config: ConfigService<Env, true>,
    ) { }

    private cookieOptions(): CookieOptions {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: this.config.get('NODE_ENV', { infer: true }) === 'production',
            path: '/',
            maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        };
    }

    @Public()
    @Post('signup') // default 201 created
    async signup(
        @Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, token } = await this.auth.signup(dto);
        res.cookie('sid', token, this.cookieOptions());
        return { user };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK) // 200
    async login(
        @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { user, token } = await this.auth.login(dto);
        res.cookie('sid', token, this.cookieOptions());
        return { user };
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT) // 204
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ): Promise<void> {
        const token = req.cookies?.['sid'] as string | undefined;

        if (token) {
            await this.auth.logout(token);
        }

        res.clearCookie('sid', { path: '/' });
    }

    @Get('me')
    me(@CurrentUser() user: User) {
        return { user }
    }
}
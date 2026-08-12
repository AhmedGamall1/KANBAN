import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService, SESSION_TTL_DAYS } from "./auth.service";
import { type SignupDto, signupSchema } from "./dto/signup.dto";
import { ZodValidationPipe } from "src/common/zod-validation.pipe";
import { type Response } from "express";
import { ConfigService } from "@nestjs/config";
import { Env } from "src/config/env.validation";

@Controller("auth")
export class AuthController {
    constructor(private readonly auth: AuthService,
        private readonly config: ConfigService<Env, true>,) { }

    @Post('signup')
    async signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupDto,
        @Res({ passthrough: true }) res: Response) {
        const { user, token } = await this.auth.signup(dto)

        res.cookie('sid', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: this.config.get('NODE_ENV', { infer: true }) === 'production',
            path: '/',
            maxAge: SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        });

        return { user }
    }
}
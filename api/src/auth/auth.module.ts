import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsRepository } from './sessions.repository';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { OauthController } from './oauth/oauth.controller';
import { OauthService } from './oauth/oauth.service';
import { IdentitiesRepository } from './oauth/identities.repository';

@Module({
    imports: [UsersModule],
    controllers: [AuthController, OauthController],
    providers: [
        AuthService,
        SessionsRepository,
        OauthService,
        IdentitiesRepository,
        { provide: APP_GUARD, useClass: AuthGuard },
    ],
    exports: [AuthService],
})
export class AuthModule { }



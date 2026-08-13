import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsRepository } from './sessions.repository';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, SessionsRepository, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule { }
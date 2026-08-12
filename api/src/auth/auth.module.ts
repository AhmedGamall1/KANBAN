import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionsRepository } from './sessions.repository';

@Module({
    imports: [UsersModule],
    controllers: [AuthController],
    providers: [AuthService, SessionsRepository],
})
export class AuthModule { }
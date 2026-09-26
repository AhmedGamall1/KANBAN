import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';
import { AccessModule } from 'src/access/access.module';
import { EventsModule } from 'src/events/events.module';
import { BoardsModule } from 'src/boards/boards.module';

@Module({
    imports: [AuthModule, AccessModule, EventsModule, BoardsModule],
    providers: [RealtimeGateway],
    exports: [RealtimeGateway],
})
export class RealtimeModule { }
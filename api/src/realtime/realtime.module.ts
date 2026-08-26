import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RealtimeGateway } from './realtime.gateway';
import { AccessModule } from 'src/access/access.module';
import { EventsModule } from 'src/events/events.module';

@Module({
    imports: [AuthModule, AccessModule, EventsModule],
    providers: [RealtimeGateway],
    exports: [RealtimeGateway],
})
export class RealtimeModule { }
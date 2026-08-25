import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardEventsController } from './board-events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

@Module({
    imports: [AccessModule],
    controllers: [BoardEventsController],
    providers: [EventsService, EventsRepository],
    exports: [EventsService],
})
export class EventsModule { }
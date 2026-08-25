import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardEventsController } from './board-events.controller';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';
import { CardActivityController } from './card-activity.controller';

@Module({
    imports: [AccessModule],
    controllers: [BoardEventsController, CardActivityController],
    providers: [EventsService, EventsRepository],
    exports: [EventsService],
})
export class EventsModule { }
import { Module } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

@Module({
    providers: [EventsService, EventsRepository],
    exports: [EventsService],
})
export class EventsModule { }
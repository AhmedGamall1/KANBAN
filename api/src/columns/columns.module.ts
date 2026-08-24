import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardColumnsController } from './board-columns.controller';
import { ColumnsController } from './columns.controller';
import { ColumnsRepository } from './columns.repository';
import { ColumnsService } from './columns.service';
import { EventsModule } from 'src/events/events.module';

@Module({
    imports: [AccessModule, EventsModule],
    controllers: [BoardColumnsController, ColumnsController],
    providers: [ColumnsService, ColumnsRepository],
    exports: [ColumnsRepository],
})
export class ColumnsModule { }

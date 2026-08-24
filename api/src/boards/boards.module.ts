import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { CardsModule } from '../cards/cards.module';
import { ColumnsModule } from '../columns/columns.module';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';
import { WorkspaceBoardsController } from './workspace-boards.controller';
import { EventsModule } from 'src/events/events.module';

@Module({
    imports: [AccessModule, ColumnsModule, CardsModule, EventsModule],
    controllers: [WorkspaceBoardsController, BoardsController],
    providers: [BoardsService, BoardsRepository],
    exports: [BoardsRepository],
})
export class BoardsModule { }

import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { BoardCardsController } from './board-cards.controller';
import { BoardColumnsController } from './board-columns.controller';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';
import { CardsController } from './cards.controller';
import { CardsRepository } from './cards.repository';
import { CardsService } from './cards.service';
import { ColumnsController } from './columns.controller';
import { ColumnsRepository } from './columns.repository';
import { ColumnsService } from './columns.service';
import { WorkspaceBoardsController } from './workspace-boards.controller';

@Module({
    imports: [AccessModule],
    controllers: [
        WorkspaceBoardsController,
        BoardsController,
        BoardColumnsController,
        ColumnsController,
        BoardCardsController,
        CardsController,
    ],
    providers: [
        BoardsService,
        BoardsRepository,
        ColumnsService,
        ColumnsRepository,
        CardsService,
        CardsRepository,
    ],
    exports: [BoardsRepository],
})
export class BoardsModule { }

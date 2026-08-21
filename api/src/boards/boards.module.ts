import { CardsRepository } from './cards.repository';
import { CardsService } from './cards.service';
import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { BoardMemberGuard } from './board-member.guard';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';
import { WorkspaceBoardsController } from './workspace-boards.controller';
import { BoardColumnsController } from './board-columns.controller';
import { ColumnsRepository } from './columns.repository';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { ColumnMemberGuard } from './column-member.guard';
import { BoardCardsController } from './board-cards.controller';

@Module({
    imports: [WorkspacesModule],
    controllers: [WorkspaceBoardsController, BoardColumnsController, BoardCardsController, ColumnsController, BoardsController],
    providers: [BoardsService, BoardsRepository, ColumnsRepository, ColumnMemberGuard, CardsService, CardsRepository, ColumnsService, BoardMemberGuard],
    exports: [BoardsRepository, BoardMemberGuard],
})
export class BoardsModule { }
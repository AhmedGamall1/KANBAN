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

@Module({
    imports: [WorkspacesModule],
    controllers: [WorkspaceBoardsController, BoardColumnsController, BoardsController],
    providers: [BoardsService, BoardsRepository, ColumnsRepository, ColumnsService, BoardMemberGuard],
    exports: [BoardsRepository, BoardMemberGuard],
})
export class BoardsModule { }
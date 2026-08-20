import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { BoardMemberGuard } from './board-member.guard';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';
import { WorkspaceBoardsController } from './workspace-boards.controller';

@Module({
    imports: [WorkspacesModule],
    controllers: [WorkspaceBoardsController, BoardsController],
    providers: [BoardsService, BoardsRepository, BoardMemberGuard],
    exports: [BoardsRepository, BoardMemberGuard],
})
export class BoardsModule { }
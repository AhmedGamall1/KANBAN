import { Module } from '@nestjs/common';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { BoardsController } from './boards.controller';
import { BoardsRepository } from './boards.repository';
import { BoardsService } from './boards.service';

@Module({
    imports: [WorkspacesModule],
    controllers: [BoardsController],
    providers: [BoardsService, BoardsRepository],
    exports: [BoardsRepository],
})
export class BoardsModule { }
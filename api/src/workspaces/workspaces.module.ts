import { Module } from '@nestjs/common';
import { MembersRepository } from './members.repository';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
    controllers: [WorkspacesController],
    providers: [WorkspacesService, WorkspacesRepository, MembersRepository],
    exports: [MembersRepository],
})
export class WorkspacesModule { }
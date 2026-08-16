import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersRepository } from './members.repository';
import { MembersService } from './members.service';
import { WorkspaceMemberGuard } from './workspace-member.guard';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
    controllers: [WorkspacesController, MembersController],
    providers: [
        WorkspacesService,
        WorkspacesRepository,
        MembersService,
        MembersRepository,
        WorkspaceMemberGuard,
    ],
    exports: [MembersRepository],
})
export class WorkspacesModule { }
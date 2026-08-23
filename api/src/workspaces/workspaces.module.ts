import { Module } from '@nestjs/common';
import { AccessModule } from '../access/access.module';
import { InvitesController } from './invites.controller';
import { InvitesRepository } from './invites.repository';
import { InvitesService } from './invites.service';
import { MembersController } from './members.controller';
import { MembersRepository } from './members.repository';
import { MembersService } from './members.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
    imports: [AccessModule],
    controllers: [WorkspacesController, MembersController, InvitesController],
    providers: [
        WorkspacesService,
        WorkspacesRepository,
        MembersService,
        MembersRepository,
        InvitesService,
        InvitesRepository,
    ],
    exports: [MembersRepository],
})
export class WorkspacesModule { }

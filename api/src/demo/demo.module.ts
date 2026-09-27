import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BoardsModule } from '../boards/boards.module';
import { CardsModule } from '../cards/cards.module';
import { ColumnsModule } from '../columns/columns.module';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        WorkspacesModule,
        BoardsModule,
        ColumnsModule,
        CardsModule,
        EventsModule,
    ],
    controllers: [DemoController],
    providers: [DemoService],
})
export class DemoModule { }

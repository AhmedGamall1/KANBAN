import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { APP_FILTER } from '@nestjs/core';
import { PostgresExceptionFilter } from './common/postgres-exception.filter';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    WorkspacesModule,
    BoardsModule,
    ColumnsModule,
    CardsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: PostgresExceptionFilter },
  ],
})
export class AppModule { }

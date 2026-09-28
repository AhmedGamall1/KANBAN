import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Env, validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PostgresExceptionFilter } from './common/postgres-exception.filter';
import { BoardsModule } from './boards/boards.module';
import { ColumnsModule } from './columns/columns.module';
import { CardsModule } from './cards/cards.module';
import { EventsModule } from './events/events.module';
import { RealtimeModule } from './realtime/realtime.module';
import { DemoModule } from './demo/demo.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { THROTTLE_LIMIT, THROTTLE_WINDOW_MS } from './common/throttle';
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        throttlers: [{ ttl: THROTTLE_WINDOW_MS, limit: THROTTLE_LIMIT }],
        skipIf: (context) =>
          !config.get('THROTTLE_ENABLED', { infer: true }) ||
          context.getType() !== 'http',
      }),
    }),
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
    EventsModule,
    RealtimeModule,
    DemoModule,
    EventEmitterModule.forRoot()
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: PostgresExceptionFilter },
  ],
})
export class AppModule { }
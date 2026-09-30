import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp, resolveClientDir } from './bootstrap';
import type { Env } from './config/env.validation';
import { Logger } from '@nestjs/common';
import { migrate } from './database/migrator';
import { syncAppRolePassword } from './database/app-role';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const clientDir = resolveClientDir(config.get('CLIENT_DIR', { infer: true }));

  app.enableShutdownHooks();
  configureApp(app, {
    clientDir,
    trustProxy: config.get('TRUST_PROXY', { infer: true }),
  });
  const logger = new Logger('Migrator');

  const applied = await migrate(
    config.get('MIGRATION_DATABASE_URL', { infer: true }),
    { log: (message) => logger.log(message) },
  );

  logger.log(
    applied.length === 0
      ? 'Schema up to date'
      : `Applied ${applied.length} migration(s)`,
  );

  const role = await syncAppRolePassword(
    config.get('MIGRATION_DATABASE_URL', { infer: true }),
    config.get('DATABASE_URL', { infer: true }),
  );

  logger.log(`Password for role ${role} set from DATABASE_URL`);

  const port = config.get('PORT', { infer: true });

  await app.listen(port);

  console.log(
    clientDir
      ? `App listening on http://localhost:${port} — serving ${clientDir}`
      : `API listening on http://localhost:${port}/api`,
  );
}

void bootstrap();
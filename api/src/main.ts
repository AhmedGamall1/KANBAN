import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp, resolveClientDir } from './bootstrap';
import type { Env } from './config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<Env, true>);
  const clientDir = resolveClientDir(config.get('CLIENT_DIR', { infer: true }));

  app.enableShutdownHooks();
  configureApp(app, { clientDir });

  const port = config.get('PORT', { infer: true });

  await app.listen(port);

  console.log(
    clientDir
      ? `App listening on http://localhost:${port} — serving ${clientDir}`
      : `API listening on http://localhost:${port}/api`,
  );
}

void bootstrap();
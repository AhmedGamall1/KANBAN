import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    const startedAt = Date.now();

    try {
      await this.db.query('SELECT 1');
    } catch (error) {
      this.logger.error('Database health check failed', error);
      throw new ServiceUnavailableException('Database unreachable');
    }

    return {
      status: 'ok',
      uptime: process.uptime(),
      db: { status: 'ok', latencyMs: Date.now() - startedAt },
    };
  }
}

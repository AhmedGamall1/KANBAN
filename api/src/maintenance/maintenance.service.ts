import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';
import { Client } from 'pg';
import type { Env } from '../config/env.validation';

export interface SweepResult {
    sessions: number;
    workspaces: number;
    users: number;
}

@Injectable()
export class MaintenanceService {
    private readonly logger = new Logger(MaintenanceService.name);

    constructor(private readonly config: ConfigService<Env, true>) { }

    @Timeout(30_000)
    @Cron(CronExpression.EVERY_HOUR)
    async scheduledSweep(): Promise<void> {
        try {
            const result = await this.sweep();

            if (result.sessions + result.workspaces + result.users > 0) {
                this.logger.log(
                    `Swept ${result.sessions} session(s), ${result.workspaces} demo workspace(s), ${result.users} demo user(s)`,
                );
            }
        } catch (error) {
            this.logger.error('Sweep failed', error);
        }
    }

    async sweep(): Promise<SweepResult> {
        const age = `${this.config.get('DEMO_TTL_HOURS', { infer: true })} hours`;

        const client = new Client({
            connectionString: this.config.get('MIGRATION_DATABASE_URL', {
                infer: true,
            }),
        });

        await client.connect();

        try {
            const sessions = await client.query(
                'DELETE FROM sessions WHERE expires_at < now()',
            );

            const workspaces = await client.query(
                `DELETE FROM workspaces
                  WHERE is_demo AND created_at < now() - $1::interval`,
                [age],
            );

            const users = await client.query(
                `DELETE FROM users u
                  WHERE u.is_demo
                    AND u.created_at < now() - $1::interval
                    AND NOT EXISTS (
                      SELECT 1 FROM workspace_members m WHERE m.user_id = u.id
                    )
                    AND NOT EXISTS (
                      SELECT 1 FROM board_events e WHERE e.actor_id = u.id
                    )`,
                [age],
            );

            return {
                sessions: sessions.rowCount ?? 0,
                workspaces: workspaces.rowCount ?? 0,
                users: users.rowCount ?? 0,
            };
        } finally {
            await client.end();
        }
    }
}
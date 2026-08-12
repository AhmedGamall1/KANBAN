import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SessionsRepository {
    constructor(private readonly db: DatabaseService) { }

    async create(input: {
        tokenHash: string;
        userId: string;
        expiresAt: Date;
    }): Promise<void> {
        await this.db.query(
            `INSERT INTO sessions (token_hash, user_id, expires_at)
       VALUES ($1, $2, $3)`,
            [input.tokenHash, input.userId, input.expiresAt],
        );
    }

    async deleteByTokenHash(tokenHash: string): Promise<void> {
        await this.db.query(`DELETE FROM sessions WHERE token_hash = $1`, [
            tokenHash,
        ]);
    }
}

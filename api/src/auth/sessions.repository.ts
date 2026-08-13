import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { toUser, User, UserRow } from 'src/users/users.repository';

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

    async findUserByTokenHash(tokenHash: string): Promise<User | null> {
        const { rows } = await this.db.query<UserRow>(
            `SELECT u.*
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = $1
          AND s.expires_at > now()`,
            [tokenHash],
        );

        return rows[0] ? toUser(rows[0]) : null;
    }

    async deleteByTokenHash(tokenHash: string): Promise<void> {
        await this.db.query(`DELETE FROM sessions WHERE token_hash = $1`, [
            tokenHash,
        ]);
    }
}

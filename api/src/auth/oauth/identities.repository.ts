import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../../database/database.service';
import { toUser, type User, type UserRow } from '../../users/users.repository';
import type { Provider } from './oauth.providers';

@Injectable()
export class IdentitiesRepository {
    constructor(private readonly db: DatabaseService) { }

    async findUser(
        provider: Provider,
        providerUserId: string,
        tx?: Queryable,
    ): Promise<User | null> {
        const { rows } = await (tx ?? this.db).query<UserRow>(
            `SELECT u.*
               FROM user_identities i
               JOIN users u ON u.id = i.user_id
              WHERE i.provider = $1 AND i.provider_user_id = $2`,
            [provider, providerUserId],
        );

        return rows[0] ? toUser(rows[0]) : null;
    }

    async link(
        input: { provider: Provider; providerUserId: string; userId: string },
        tx?: Queryable,
    ): Promise<void> {
        await (tx ?? this.db).query(
            `INSERT INTO user_identities (provider, provider_user_id, user_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (provider, provider_user_id) DO NOTHING`,
            [input.provider, input.providerUserId, input.userId],
        );
    }
}
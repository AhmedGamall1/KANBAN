import { Injectable } from '@nestjs/common';
import { DatabaseService, type Queryable } from '../database/database.service';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  avatarUrl: string | null
  createdAt: Date;
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  name: string;
  avatar_color: string;
  avatar_url: string | null;
  created_at: Date;
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) { }

  async create(input: {
    email: string;
    passwordHash: string;
    name: string;
    avatarColor: string;
  }): Promise<User> {
    const { rows } = await this.db.query<UserRow>(
      `INSERT INTO users (email, password_hash, name, avatar_color)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.email, input.passwordHash, input.name, input.avatarColor],
    );

    return toUser(rows[0]);
  }

  async findCredentialsByEmail(
    email: string,
  ): Promise<{ user: User; passwordHash: string | null } | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (!rows[0]) {
      return null;
    }

    return { user: toUser(rows[0]), passwordHash: rows[0].password_hash };
  }

  async findByEmail(email: string, tx?: Queryable): Promise<User | null> {
    const { rows } = await (tx ?? this.db).query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    return rows[0] ? toUser(rows[0]) : null;
  }

  async createFromProvider(
    input: {
      email: string;
      name: string;
      avatarColor: string;
      avatarUrl: string | null;
    },
    tx?: Queryable,
  ): Promise<User> {
    const { rows } = await (tx ?? this.db).query<UserRow>(
      `INSERT INTO users (email, name, avatar_color, avatar_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.email, input.name, input.avatarColor, input.avatarUrl],
    );

    return toUser(rows[0]);
  }

  async applyProviderAvatar(
    id: string,
    avatarUrl: string | null,
    tx?: Queryable,
  ): Promise<User> {
    const { rows } = await (tx ?? this.db).query<UserRow>(
      `UPDATE users
          SET avatar_url = coalesce($2, avatar_url)
        WHERE id = $1
        RETURNING *`,
      [id, avatarUrl],
    );

    return toUser(rows[0]);
  }
}

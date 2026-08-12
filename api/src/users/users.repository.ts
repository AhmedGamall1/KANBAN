import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
  createdAt: Date;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  avatar_color: string;
  created_at: Date;
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarColor: row.avatar_color,
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
  ): Promise<{ user: User; passwordHash: string } | null> {
    const { rows } = await this.db.query<UserRow>(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (!rows[0]) {
      return null;
    }

    return { user: toUser(rows[0]), passwordHash: rows[0].password_hash };
  }
}

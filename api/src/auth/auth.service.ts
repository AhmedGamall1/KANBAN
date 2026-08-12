import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { type User, UsersRepository } from 'src/users/users.repository';
import { SessionsRepository } from './sessions.repository';
import { SignupDto } from './dto/signup.dto';
import * as argon2 from 'argon2'
import { createHash, randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';


const AVATAR_COLORS = [
    '#e11d48',
    '#d97706',
    '#65a30d',
    '#0891b2',
    '#4f46e5',
    '#c026d3',
];

export const SESSION_TTL_DAYS = 30;


export function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}

function isUniqueViolation(error: unknown): boolean {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
    );
}

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersRepository,
        private readonly sessions: SessionsRepository,
    ) { }



    async signup(dto: SignupDto): Promise<{ user: User, token: string }> {
        const passwordHash = await argon2.hash(dto.password)

        const avatarColor =
            AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

        let user: User

        try {
            user = await this.users.create({
                email: dto.email,
                passwordHash,
                name: dto.name,
                avatarColor
            })
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new ConflictException('Email already registered');
            }
            throw error;
        }


        return { user, token: await this.createSession(user.id) };
    }

    async login(dto: LoginDto): Promise<{ user: User, token: string }> {
        const found = await this.users.findCredentialsByEmail(dto.email)

        if (!found) {
            // to make the attacker wait the same time if the email found
            await argon2.hash(dto.password);
            throw new UnauthorizedException('Invalid email or password');
        }

        const valid = await argon2.verify(found.passwordHash, dto.password);

        if (!valid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return { user: found.user, token: await this.createSession(found.user.id) };
    }

    async logout(token: string): Promise<void> {
        await this.sessions.deleteByTokenHash(hashToken(token))
    }

    private async createSession(userId: string): Promise<string> {
        const token = randomBytes(32).toString('base64url');
        const expiresAt = new Date(
            Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
        );

        await this.sessions.create({ tokenHash: hashToken(token), userId, expiresAt });

        return token;
    }
}


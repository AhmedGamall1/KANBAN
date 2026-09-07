import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import type { Env } from '../../config/env.validation';
import { type User, UsersRepository } from '../../users/users.repository';
import { AuthService, randomAvatarColor } from '../auth.service';
import { IdentitiesRepository } from './identities.repository';
import {
    PROVIDERS,
    type OAuthProfile,
    type Provider,
} from './oauth.providers';

export class UnverifiedEmailError extends Error { }

@Injectable()
export class OauthService {
    constructor(
        private readonly config: ConfigService<Env, true>,
        private readonly db: DatabaseService,
        private readonly users: UsersRepository,
        private readonly identities: IdentitiesRepository,
        private readonly auth: AuthService,
    ) { }

    private credentials(provider: Provider): {
        clientId: string;
        clientSecret: string;
    } {
        const clientId = this.config.get(
            provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'GITHUB_CLIENT_ID',
            { infer: true },
        );
        const clientSecret = this.config.get(
            provider === 'google' ? 'GOOGLE_CLIENT_SECRET' : 'GITHUB_CLIENT_SECRET',
            { infer: true },
        );

        if (!clientId || !clientSecret) {
            throw new ServiceUnavailableException(`${provider} sign in is not configured`);
        }

        return { clientId, clientSecret };
    }

    redirectUri(provider: Provider): string {
        const origin = this.config.get('WEB_ORIGIN', { infer: true });

        return `${origin}/api/auth/oauth/${provider}/callback`;
    }

    authorizationUrl(provider: Provider, state: string): string {
        const url = new URL(PROVIDERS[provider].authorizeUrl);

        url.searchParams.set('client_id', this.credentials(provider).clientId);
        url.searchParams.set('redirect_uri', this.redirectUri(provider));
        url.searchParams.set('response_type', 'code');
        url.searchParams.set('scope', PROVIDERS[provider].scope);
        url.searchParams.set('state', state);

        for (const [key, value] of Object.entries(PROVIDERS[provider].params ?? {})) {
            url.searchParams.set(key, value);
        }


        return url.toString();
    }

    async signIn(provider: Provider, code: string): Promise<string> {
        const accessToken = await this.exchangeCode(provider, code);
        const profile = await PROVIDERS[provider].fetchProfile(accessToken);

        if (!profile.emailVerified) {
            throw new UnverifiedEmailError();
        }

        const user = await this.resolveUser(provider, profile);

        return this.auth.createSession(user.id);
    }

    private async exchangeCode(provider: Provider, code: string): Promise<string> {
        const { clientId, clientSecret } = this.credentials(provider);

        const response = await fetch(PROVIDERS[provider].tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: this.redirectUri(provider),
                grant_type: 'authorization_code',
            }),
        });

        const body = (await response.json()) as {
            access_token?: string;
            error?: string;
        };

        if (!response.ok || !body.access_token) {
            throw new Error(body.error ?? `token endpoint responded ${response.status}`);
        }

        return body.access_token;
    }

    private resolveUser(
        provider: Provider,
        profile: OAuthProfile,
    ): Promise<User> {
        return this.db.transaction(async (tx) => {
            const linked = await this.identities.findUser(
                provider,
                profile.providerUserId,
                tx,
            );

            if (linked) {
                return this.users.applyProviderAvatar(linked.id, profile.avatarUrl, tx);
            }

            const existing = await this.users.findByEmail(profile.email, tx);

            const user =
                existing ??
                (await this.users.createFromProvider(
                    {
                        email: profile.email,
                        name: profile.name,
                        avatarColor: randomAvatarColor(),
                        avatarUrl: profile.avatarUrl,
                    },
                    tx,
                ));

            await this.identities.link(
                { provider, providerUserId: profile.providerUserId, userId: user.id },
                tx,
            );

            return this.users.applyProviderAvatar(user.id, profile.avatarUrl, tx);
        });
    }
}
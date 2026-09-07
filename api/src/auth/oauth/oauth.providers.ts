export type Provider = 'google' | 'github';

export interface OAuthProfile {
    providerUserId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    avatarUrl: string | null;
}

interface ProviderConfig {
    authorizeUrl: string;
    tokenUrl: string;
    scope: string;
    fetchProfile(accessToken: string): Promise<OAuthProfile>;
}

async function getJson<T>(url: string, accessToken: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'User-Agent': 'collab-board',
        },
    });

    if (!response.ok) {
        throw new Error(`${url} responded ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export const PROVIDERS: Record<Provider, ProviderConfig> = {
    google: {
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'openid email profile',
        async fetchProfile(accessToken) {
            const profile = await getJson<{
                sub: string;
                email: string;
                email_verified: boolean;
                name?: string;
                picture?: string;
            }>('https://openidconnect.googleapis.com/v1/userinfo', accessToken);

            return {
                providerUserId: profile.sub,
                email: profile.email,
                emailVerified: profile.email_verified === true,
                name: profile.name ?? profile.email.split('@')[0],
                avatarUrl: profile.picture ?? null,
            };
        },
    },

    github: {
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'read:user user:email',
        async fetchProfile(accessToken) {
            const profile = await getJson<{
                id: number;
                login: string;
                name: string | null;
                avatar_url: string | null;
            }>('https://api.github.com/user', accessToken);

            const emails = await getJson<
                { email: string; primary: boolean; verified: boolean }[]
            >('https://api.github.com/user/emails', accessToken);

            const chosen =
                emails.find((entry) => entry.primary && entry.verified) ??
                emails.find((entry) => entry.verified);

            if (!chosen) {
                throw new Error('GitHub account has no verified email');
            }

            return {
                providerUserId: String(profile.id),
                email: chosen.email,
                emailVerified: true,
                name: profile.name ?? profile.login,
                avatarUrl: profile.avatar_url,
            };
        },
    },
};
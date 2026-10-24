import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';

const HOURLY_LIMIT = 10;
const HOUR_MS = 60 * 60 * 1000;

export type SignupMethod = 'email' | 'google' | 'github';

const METHOD_LABELS: Record<SignupMethod, string> = {
    email: 'email and password',
    google: 'Google',
    github: 'GitHub',
};

function fromCountry(code: string | undefined): string {
    if (!code || !/^[A-Z]{2}$/.test(code) || code === 'XX' || code === 'T1') {
        return '';
    }

    try {
        const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);

        return name ? ` from ${name}` : '';
    } catch {
        return '';
    }
}

function cairoTime(): string {
    return new Date().toLocaleString('en-GB', {
        timeZone: 'Africa/Cairo',
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

@Injectable()
export class Notifier {
    private readonly logger = new Logger(Notifier.name);
    private readonly sentAt: number[] = [];

    constructor(private readonly config: ConfigService<Env, true>) { }

    demoStarted(country: string | undefined): Promise<void> {
        return this.send(
            'Demo started',
            `Someone started the demo${fromCountry(country)} at ${cairoTime()} (Cairo time).`,
        );
    }

    signedUp(
        user: { name: string; email: string },
        method: SignupMethod,
        country: string | undefined,
    ): Promise<void> {
        return this.send(
            'New sign-up',
            `${user.name} (${user.email}) signed up with ${METHOD_LABELS[method]}${fromCountry(country)} at ${cairoTime()} (Cairo time).`,
        );
    }

    private async send(subject: string, text: string): Promise<void> {
        const apiKey = this.config.get('RESEND_API_KEY', { infer: true });
        const to = this.config.get('NOTIFY_EMAIL', { infer: true });

        if (!apiKey || !to) {
            return;
        }

        const cutoff = Date.now() - HOUR_MS;

        while (this.sentAt.length > 0 && this.sentAt[0] < cutoff) {
            this.sentAt.shift();
        }

        if (this.sentAt.length >= HOURLY_LIMIT) {
            this.logger.warn(`Skipped "${subject}": hourly email limit reached`);
            return;
        }

        this.sentAt.push(Date.now());

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'Collab Board <onboarding@resend.dev>',
                    to: [to],
                    subject: `${subject} · Collab Board`,
                    text,
                }),
                signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) {
                this.logger.warn(`Email "${subject}" failed with ${response.status}`);
            }
        } catch (error) {
            this.logger.warn(`Email "${subject}" failed: ${String(error)}`);
        }
    }
}

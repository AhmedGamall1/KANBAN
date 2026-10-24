import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation';
import { Notifier } from './notifier.service';

function notifierWith(values: Partial<Record<keyof Env, string>>): Notifier {
    const config = {
        get: (key: keyof Env) => values[key],
    } as unknown as ConfigService<Env, true>;

    return new Notifier(config);
}

const configured = {
    RESEND_API_KEY: 're_test_key',
    NOTIFY_EMAIL: 'owner@example.com',
};

describe('Notifier', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
        fetchSpy = jest
            .spyOn(global, 'fetch')
            .mockResolvedValue(new Response('{}', { status: 200 }));
    });

    afterEach(() => {
        fetchSpy.mockRestore();
    });

    it('sends nothing when it is not configured', async () => {
        await notifierWith({}).demoStarted('EG');

        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('emails the owner through Resend with the country name', async () => {
        await notifierWith(configured).signedUp(
            { name: 'Sara', email: 'sara@example.com' },
            'google',
            'EG',
        );

        expect(fetchSpy).toHaveBeenCalledTimes(1);

        const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
        const body = JSON.parse(String(init.body));

        expect(url).toBe('https://api.resend.com/emails');
        expect(init.headers).toMatchObject({ Authorization: 'Bearer re_test_key' });
        expect(body.to).toEqual(['owner@example.com']);
        expect(body.subject).toBe('New sign-up · Collab Board');
        expect(body.text).toContain('Sara (sara@example.com) signed up with Google from Egypt');
    });

    it('stops after ten emails an hour', async () => {
        const notifier = notifierWith(configured);

        for (let index = 0; index < 11; index += 1) {
            await notifier.demoStarted(undefined);
        }

        expect(fetchSpy).toHaveBeenCalledTimes(10);
    });

    it('never throws when sending fails', async () => {
        fetchSpy.mockRejectedValue(new Error('network down'));

        await expect(notifierWith(configured).demoStarted('EG')).resolves.toBeUndefined();
    });
});

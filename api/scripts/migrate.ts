import { config as loadEnv } from 'dotenv';
import { migrate } from '../src/database/migrator';

loadEnv();

const url = process.env.MIGRATION_DATABASE_URL;

if (!url) {
    console.error('MIGRATION_DATABASE_URL is not set');
    process.exit(1);
}

migrate(url, { log: (message) => console.log(message) })
    .then((applied) => {
        console.log(
            applied.length === 0
                ? 'No pending migrations.'
                : `Applied ${applied.length} migration(s).`,
        );
    })
    .catch((error: unknown) => {
        console.error(error);
        process.exit(1);
    });
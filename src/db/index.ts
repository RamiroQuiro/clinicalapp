import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

if (!import.meta.env.TURSO_DB_URL || !import.meta.env.TURSO_DB_AUTH_TOKEN) {
  throw new Error('Missing Turso database credentials');
}
console.log(import.meta.env.TURSO_DB_URL);
console.log(import.meta.env.TURSO_DB_AUTH_TOKEN);

const client = createClient({
  url: import.meta.env.TURSO_DB_URL,
  authToken: import.meta.env.TURSO_DB_AUTH_TOKEN,
});

const db = drizzle(client);

export default db;

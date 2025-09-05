import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { users } from './users';

export const atencionAmendments = sqliteTable('atencionAmendments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  atencionId: text('atencionId')
    .references(() => atenciones.id)
    .notNull(),
  userId: text('userId')
    .references(() => users.id)
    .notNull(), // Who made the amendment
  reason: text('reason').notNull(), // Brief reason for amendment (e.g., "Corrección de diagnóstico")
  details: text('details').notNull(), // Full text of the amendment
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

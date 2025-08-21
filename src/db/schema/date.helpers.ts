import { sql } from 'drizzle-orm';
import { integer } from 'drizzle-orm/sqlite-core';

// columns.helpers.ts
const timestamps = {
  // CONTROL DE FECHAS
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`strftime('%s', 'now')`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
};

export default timestamps;

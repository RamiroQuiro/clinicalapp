import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const notasMedicas = sqliteTable('notasMedicas', {
  id: text('id').primaryKey().unique(),
  pacienteId: text('pacienteId').notNull(),
  userId: text('userId').notNull(),
  observaciones: text('observaciones'),
  descripcion: text('descripcion'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

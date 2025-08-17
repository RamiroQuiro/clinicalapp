import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const archivosAdjuntos = sqliteTable('archivosAdjuntos', {
  id: text('id').primaryKey().unique(),
  nombre: text('nombre').notNull(),
  pacienteId: text('pacienteId').notNull(),
  descripcion: text('descripcion').notNull(),
  url: text('url').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  estado: text('estado'),
  tipo: text('tipo'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

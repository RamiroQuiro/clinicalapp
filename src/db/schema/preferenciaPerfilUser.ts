import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const preferenciaPerfilUser = sqliteTable('preferenciaPerfilUser', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  nombrePerfil: text('nombrePerfil'),
  especialidad: text('especialidad'),
  estado: text('estado'),
  preferencias: text('preferencias', { mode: 'json' }).default(JSON.stringify({})),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

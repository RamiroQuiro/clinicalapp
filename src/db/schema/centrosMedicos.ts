import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const centrosMedicos = sqliteTable('centrosMedicos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  tipo: text('tipo', { enum: ['sanatorio', 'clinica', 'consultorio', 'hospital'] }).notNull(),
  direccion: text('direccion'),
  telefono: text('telefono'),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

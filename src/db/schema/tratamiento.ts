import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const tratamiento = sqliteTable('tratamiento', {
  id: text('id').primaryKey().unique(),
  tratamiento: text('tratamiento').notNull(),
  descripcion: text('descripcion'),
  historiaClinicaId: text('historiaClinicaId').notNull(),
  pacienteId: text('pacienteId').notNull(),
  userId: text('userId').notNull(),
  duracion: text('duracion'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

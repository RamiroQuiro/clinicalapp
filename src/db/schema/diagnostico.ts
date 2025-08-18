import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const diagnostico = sqliteTable('diagnostico', {
  id: text('id').primaryKey().unique(),
  diagnostico: text('diagnostico').notNull(),
  historiaClinicaId: text('historiaClinicaId'),
  atencionId: text('atencionId').notNull(),
  pacienteId: text('pacienteId').notNull(),
  codigoCIE: text('codigoCIE').notNull(),
  userId: text('userId').notNull(),
  observaciones: text('observaciones'),
  tratamiento: text('tratamiento'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

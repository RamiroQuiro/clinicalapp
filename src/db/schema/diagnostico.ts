import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

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
  updated_at: text('updated_at'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text('deleted_at'),
});

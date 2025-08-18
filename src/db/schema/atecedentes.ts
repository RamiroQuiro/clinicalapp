import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const antecedentes = sqliteTable('antecedentes', {
  id: text('id').primaryKey(),
  antecedente: text('antecedente').notNull(),
  pacienteId: text('pacienteId').notNull(), // Relación con el paciente
  tipo: text('tipo').notNull(), // Ejemplo: "Personal", "Familiar", "Hábitos"
  descripcion: text('descripcion'),
  observaciones: text('observaciones'),
  condicion: text('condicion'),
  estado: text('estado'),
  fechaDiagnostico: integer('fechaDiagnostico', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

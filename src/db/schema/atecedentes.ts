import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';
import { users } from './users';

export const antecedentes = sqliteTable('antecedentes', {
  id: text('id').primaryKey(),
  antecedente: text('antecedente').notNull(),
  pacienteId: text('pacienteId')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // Relación con el paciente
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // Relación con el usuario
  centroMedicoId: text('centroMedicoId')
    .notNull()
    .references(() => centrosMedicos.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // Relación con el centro médico
  tipo: text('tipo').notNull(), // Ejemplo: "Personal", "Familiar", "Hábitos"
  descripcion: text('descripcion'),
  observaciones: text('observaciones'),
  condicion: text('condicion'),
  estado: text('estado'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  fechaDiagnostico: integer('fechaDiagnostico', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

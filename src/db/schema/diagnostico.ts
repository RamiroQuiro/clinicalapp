import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';
import { users } from './users';

export const diagnostico = sqliteTable('diagnostico', {
  id: text('id').primaryKey().unique(),
  diagnostico: text('diagnostico').notNull(),
  historiaClinicaId: text('historiaClinicaId'),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id, { onDelete: 'cascade' }),
  pacienteId: text('pacienteId')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  centroMedicoId: text('centroMedicoId')
    .notNull()
    .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
  codigoCIE: text('codigoCIE'),
  userMedicoId: text('userMedicoId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  observaciones: text('observaciones'),
  tratamiento: text('tratamiento'),
  estado: text('estado', { enum: ['activo', 'curado', 'controlado'] })
    .notNull()
    .default('activo'),
  ultimaModificacionPorId: text('ultimaModificacionPorId').references(() => users.id),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

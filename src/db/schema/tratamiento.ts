import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { historiaClinica } from './historiaClinica';
import { pacientes } from './pacientes';
import { users } from './users';

export const tratamiento = sqliteTable('tratamiento', {
  id: text('id').primaryKey(),
  tratamiento: text('tratamiento').notNull(),
  descripcion: text('descripcion'),
  atencionesId: text('atencionesId').references(() => atenciones.id, { onDelete: 'cascade' }),
  historiaClinicaId: text('historiaClinicaId').references(() => historiaClinica.id, {
    onDelete: 'cascade',
  }),
  pacienteId: text('pacienteId').references(() => pacientes.id, { onDelete: 'cascade' }),
  fechaInicio: integer('fechaInicio', { mode: 'timestamp' }),
  fechaFin: integer('fechaFin', { mode: 'timestamp' }),
  estado: text('estado', { enum: ['pendiente', 'en_proceso', 'finalizado'] }).default('en_proceso'),
  userMedicoId: text('userMedicoId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  duracion: text('duracion'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

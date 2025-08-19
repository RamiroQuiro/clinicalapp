import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { historiaClinica } from './historiaClinica';
import { pacientes } from './pacientes';
import { tratamiento } from './tratamiento';
import { users } from './users';

export const atenciones = sqliteTable('atenciones', {
  id: text('id').primaryKey(),
  historiaClinicaId: text('historiaClinicaId').references(() => historiaClinica.id),
  pacienteId: text('pacienteId')
    .notNull()
    .references(() => pacientes.id),
  userIdMedico: text('userIdMedico')
    .notNull()
    .references(() => users.id),
  fecha: integer('fecha', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  motivoConsulta: text('motivoConsulta'),
  tratamientoId: text('tratamientoId').references(() => tratamiento.id),
  motivoInicial: text('motivoInicial'),
  observaciones: text('observaciones'),
  estado: text('estado', { enum: ['pendiente', 'en_curso', 'enAtencion', 'finalizada'] }).default(
    'pendiente'
  ),
  inicioAtencion: integer('inicioAtencion', { mode: 'timestamp' }),
  finAtencion: integer('finAtencion', { mode: 'timestamp' }),
  duracionAtencion: integer('duracionAtencion', { mode: 'number' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

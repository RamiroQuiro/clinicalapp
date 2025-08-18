import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { pacientes } from './pacientes';
import { users } from './users';

export const historiaClinica = sqliteTable('historiaClinica', {
  id: text('id').primaryKey(),

  pacienteId: text('pacienteId')
    .notNull()
    .references(() => pacientes.id),

  userIdResponsable: text('userIdResponsable') // quién abrió/atiende la HC
    .notNull()
    .references(() => users.id),

  numeroHC: text('numeroHC'), // número interno de historia clínica

  // Datos clínicos / ficha
  obraSocial: text('obraSocial'),
  nObraSocial: text('nObraSocial'),
  historialMedico: text('historialMedico'),
  observaciones: text('observaciones'),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  // Datos complementarios del paciente (no tan básicos como en `pacientes`)
  email: text('email'),
  celular: text('celular'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  provincia: text('provincia'),
  pais: text('pais'),
  estatura: text('estatura'),
  grupoSanguineo: text('grupoSanguineo'),

  // Control de estado y trazabilidad
  fechaApertura: integer('fechaApertura', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),

  estado: text('estado').default('activa'),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),

  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

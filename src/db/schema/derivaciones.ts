import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { users } from './users';

import { sql } from 'drizzle-orm';
import { pacientes } from './pacientes';

export const derivaciones = sqliteTable('derivaciones', {
  id: text('id').primaryKey().unique(),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id),
  userIdOrigen: text('userIdOrigen')
    .notNull()
    .references(() => users.id),
  userIdDestino: text('userIdDestino').references(() => users.id),
  pacienteId: text('pacienteId').references(() => pacientes.id),
  nombreProfesionalExterno: text('nombreProfesionalExterno'),
  especialidadDestino: text('especialidadDestino'),
  motivoDerivacion: text('motivoDerivacion'),
  estado: text('estado', { enum: ['pendiente', 'aceptada', 'rechazada', 'completada', 'eliminado'] }).default('pendiente'), // pendiente, aceptada, rechazada, completada
  fecha: integer('fecha', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

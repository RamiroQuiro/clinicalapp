import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { users } from './users';

export const turnos = sqliteTable('turnos', {
  id: text('id').primaryKey().unique(),
  pacienteId: text('pacienteId')
    .references(() => pacientes.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  otorgaUserId: text('otorgaUserId')
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  userMedicoId: text('userMedicoId')
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  fechaTurno: integer('fechaTurno', { mode: 'timestamp' }).notNull(),
  atencionId: text('atencionId').references(() => atenciones.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  tipoConsulta: text('tipoConsulta'),
  fechaAtencion: integer('fechaAtencion', { mode: 'timestamp' }),
  horaAtencion: text('horaAtencion').notNull(),
  motivoConsulta: text('motivoConsulta'),
  motivoInicial: text('motivoInicial'),
  estado: text('estado', {
    enum: ['pendiente', 'en_proceso', 'finalizado', 'confimado', 'cancelado'],
  }).default('pendiente'),

  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { turnos } from './turnos';
import { users } from './users';

export const salaDeEspera = sqliteTable('salaDeEspera', {
  id: text('id').primaryKey(),
  turnoId: text('turnoId')
    .references(() => turnos.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  pacienteId: text('pacienteId')
    .references(() => pacientes.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  atencionId: text('atencionId').references(() => atenciones.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  nombrePaciente: text('nombrePaciente').notNull(),
  apellidoPaciente: text('apellidoPaciente').notNull(),
  dniPaciente: text('dniPaciente').notNull(),
  userMedicoId: text('userMedicoId')
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  horaAtencion: text('horaAtencion').notNull(),
  horaLlegada: integer('horaLlegada', { mode: 'timestamp' }),
  orden: integer('orden'),
  motivoConsulta: text('motivoConsulta'),
  estado: text('estado', {
    enum: ['pendiente', 'en_consulta', 'atendido', 'cancelado', 'ausente'],
  }).default('pendiente'),
  isExist: integer('isExist', { mode: 'boolean' }).default(false),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

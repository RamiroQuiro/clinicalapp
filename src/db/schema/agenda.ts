import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const agenda = sqliteTable('agenda', {
  id: text('id').primaryKey(),
  centroMedicoId: text('centroMedicoId').notNull().references(() => centrosMedicos.id),
  duracionTurnoPorDefecto: integer('duracionTurnoPorDefecto').default(30), // en minutos
});

export const horariosTrabajo = sqliteTable('horariosTrabajo', {
  id: text('id').primaryKey(),
  agendaId: text('agendaId').references(() => agenda.id),
  medicoId: text('medico_id').references(() => users.id), // Opcional, si es por médico
  diaSemana: integer('diaSemana').notNull(), // 0: Domingo, 1: Lunes...
  horaInicio: text('horaInicio').notNull(), // "HH:MM"
  horaFin: text('horaFin').notNull(),     // "HH:MM"
});

export const tiposTurno = sqliteTable('tiposTurno', {
  id: text('id').primaryKey(),
  agendaId: text('agendaId').references(() => agenda.id),
  nombre: text('nombre').notNull(),
  duracion: integer('duracion'),
  color: text('color').default('#3b82f6'),
});

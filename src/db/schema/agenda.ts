import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const agendaGeneralCentroMedico = sqliteTable('agendaGeneralCentroMedico', {
  id: text('id').primaryKey(),
  centroMedicoId: text('centroMedicoId').notNull().references(() => centrosMedicos.id),
  duracionTurnoPorDefecto: integer('duracionTurnoPorDefecto', { mode: 'number' }).default(30),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const horariosTrabajo = sqliteTable(
  'horariosTrabajo',
  {
    id: text('id').primaryKey(),
    agendaGeneralCentroMedicoId: text('agendaGeneralCentroMedicoId').references(
      () => agendaGeneralCentroMedico.id
    ),
    userMedicoId: text('userMedicoId').references(() => users.id),
    diaSemana: text('diaSemana', {
      enum: ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'],
    }).notNull(),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    horaInicioManana: text('horaInicioManana'),
    horaFinManana: text('horaFinManana'),
    horaInicioTarde: text('horaInicioTarde'),
    horaFinTarde: text('horaFinTarde'),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => {
    return {
      uq: unique('horarios_trabajo_medico_dia_unique').on(table.userMedicoId, table.diaSemana),
    };
  }
);

export const tiposTurno = sqliteTable('tiposTurno', {
  id: text('id').primaryKey(),
  agendaGeneralCentroMedicoId: text('agendaGeneralCentroMedicoId').references(() => agendaGeneralCentroMedico.id),
  nombre: text('nombre').notNull(),
  duracion: integer('duracion'),
  color: text('color').default('#3b82f6'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

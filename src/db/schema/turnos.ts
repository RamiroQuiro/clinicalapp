import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';
import { users } from './users';

export const turnos = sqliteTable(
  'turnos',
  {
    id: text('id').primaryKey(),
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
    duracion: integer('duracion', { mode: 'number' }),
    atencionId: text('atencionId').references(() => atenciones.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    centroMedicoId: integer('centroMedicoId').references(() => centrosMedicos.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    tipoConsulta: text('tipoConsulta'),
    fechaAtencion: integer('fechaAtencion', { mode: 'timestamp' }),
    horaLlegadaPaciente: integer('horaLlegadaPaciente', { mode: 'timestamp' }),
    horaAtencion: text('horaAtencion', { mode: 'text' }).notNull(),
    motivoConsulta: text('motivoConsulta'),
    motivoInicial: text('motivoInicial'),
    estado: text('estado', {
      enum: [
        'pendiente',
        'en_consulta',
        'sala_de_espera',
        'finalizado',
        'confirmado',
        'cancelado',
        'ausente',
        'demorado',
      ],
    }).default('pendiente'),

    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => [
    [unique().on(t.fechaTurno, t.userMedicoId)],
    {
      idx_turnos_centro_fecha: index('idx_turnos_centro_fecha').on(t.centroMedicoId, t.fechaTurno),
      idx_turnos_fecha: index('idx_turnos_fecha').on(t.fechaTurno),
      idx_turnos_centro: index('idx_turnos_centro').on(t.centroMedicoId),
    },
  ]
);

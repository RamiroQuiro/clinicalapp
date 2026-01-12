import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';
import { users } from './users';

export const turnos = sqliteTable(
  'turnos',
  {
    id: text('id').primaryKey(),
    pacienteId: text('pacienteId')
      .references(() => pacientes.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // Puede ser nulo para reservas publicas no confirmadas
    otorgaUserId: text('otorgaUserId')
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // Puede ser nulo si es auto-agendado
    userMedicoId: text('userMedicoId')
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
    fechaTurno: integer('fechaTurno', { mode: 'timestamp' }).notNull(),
    duracion: integer('duracion', { mode: 'number' }),
    atencionId: text('atencionId').references(() => atenciones.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    centroMedicoId: text('centroMedicoId').references(() => centrosMedicos.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    tipoDeTurno: text('tipoDeTurno', { enum: ['programado', 'espontaneo', 'sobreturno'] }).default(
      'programado'
    ),
    tipoConsulta: text('tipoConsulta'),
    fechaAtencion: integer('fechaAtencion', { mode: 'timestamp' }),
    horaLlegadaPaciente: integer('horaLlegadaPaciente', { mode: 'timestamp' }),
    horaAtencion: text('horaAtencion', { mode: 'text' }).notNull(),
    motivoConsulta: text('motivoConsulta'),
    motivoInicial: text('motivoInicial'),

    // Campos para reservas publicas (Reserva Efimera)
    datosPacienteTemporal: text('datosPacienteTemporal', { mode: 'json' }), // JSON con datos del paciente temporal
    tokenConfirmacion: text('tokenConfirmacion'), // Token para validar email
    fechaExpiracion: integer('fechaExpiracion', { mode: 'timestamp' }), // Cuando expira la reserva si no confirma
    origen: text('origen', { enum: ['interno', 'publico'] }).default('interno'),

    estado: text('estado', {
      enum: [
        'pendiente',
        'pendiente_validacion',
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
    uniqueIndex('uniq_turno_activo')
      .on(t.fechaTurno, t.userMedicoId, t.pacienteId)
      .where(sql`${t.estado} NOT IN ('cancelado', 'ausente', 'finalizado') AND ${t.deleted_at} IS NULL`),
    {
      idx_turnos_centro_fecha: index('idx_turnos_centro_fecha').on(t.centroMedicoId, t.fechaTurno),
      idx_turnos_fecha: index('idx_turnos_fecha').on(t.fechaTurno),
      idx_turnos_centro: index('idx_turnos_centro').on(t.centroMedicoId),
    },
  ]
);

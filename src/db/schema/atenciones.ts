import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { historiaClinica } from './historiaClinica';
import { pacientes } from './pacientes';
import { turnos } from './turnos';
import { users } from './users';

export const atenciones = sqliteTable(
  'atenciones',
  {
    id: text('id').primaryKey(),
    historiaClinicaId: text('historiaClinicaId').references(() => historiaClinica.id),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id),
    userIdMedico: text('userIdMedico')
      .notNull()
      .references(() => users.id),
    ultimaModificacionPorId: text('ultimaModificacionPorId').references(() => users.id),
    fecha: integer('fecha', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    motivoConsulta: text('motivoConsulta'),
    sintomas: text('sintomas'),
    tratamientoId: text('tratamientoId'),
    tratamiento: text('tratamiento'),
    planSeguir: text('planSeguir'),
    turnoId: text('turnoId').references(() => turnos.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
    centroMedicoId: integer('centroMedicoId')
      .references(() => centrosMedicos.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),
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
  },
  (t) => [
    // 🧭 Búsquedas por paciente (historial)
    index('idx_atenciones_paciente').on(t.pacienteId),

    // 🏥 Consultas por centro y fecha (reportes diarios, agenda)
    index('idx_atenciones_centro_fecha').on(t.centroMedicoId, t.fecha),

    // 👨‍⚕️ Consultas por médico + estado (pantalla de atención activa)
    index('idx_atenciones_medico_estado').on(t.userIdMedico, t.estado),

    // 🔄 Consultas por turno (relación directa turno -> atención)
    index('idx_atenciones_turno').on(t.turnoId),

    // 📅 Consultas por centro + médico + fecha (filtros combinados)
    index('idx_atenciones_centro_medico_fecha').on(t.centroMedicoId, t.userIdMedico, t.fecha),
  ]
);

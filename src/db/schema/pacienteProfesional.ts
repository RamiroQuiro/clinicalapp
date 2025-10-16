import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';
import { users } from './users';

export const pacienteProfesional = sqliteTable(
  'pacienteProfesional',
  {
    id: text('id').primaryKey(),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    estado: text('estado', {
      enum: ['activo', 'inactivo', 'derivado', 'alta'],
    }).default('activo'),
    centroMedicoId: text('centroMedicoId')
      .notNull()
      .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    fechaAsignacion: integer('fechaAsignacion', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    fechaBaja: integer('fechaBaja', { mode: 'timestamp' }),
    motivoBaja: text('motivoBaja'),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),

    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  },
  table => {
    return {
      // ✅ CONSTRAINT única: Un paciente no puede estar dos veces con mismo profesional
      uniquePacienteProfesional: unique().on(table.pacienteId, table.userId),

      // 🔍 ÍNDICES CRÍTICOS para búsquedas rápidas:

      // 1. Búsqueda: "¿Qué pacientes tiene este doctor?"
      userIdEstadoIdx: sql`INDEX idx_pacprof_userid_estado ON pacienteProfesional(${table.userId}, ${table.estado})`,

      // 2. Búsqueda: "¿Qué doctores atienden este paciente?"
      pacienteIdEstadoIdx: sql`INDEX idx_pacprof_pacienteid_estado ON pacienteProfesional(${table.pacienteId}, ${table.estado})`,

      // 3. Búsqueda: "Pacientes activos recientemente asignados"
      estadoFechaAsignacionIdx: sql`INDEX idx_pacprof_estado_fecha ON pacienteProfesional(${table.estado}, ${table.fechaAsignacion})`,

      // 4. Búsqueda combinada para verificaciones rápidas
      userPacienteIdx: sql`INDEX idx_pacprof_user_paciente ON pacienteProfesional(${table.userId}, ${table.pacienteId})`,
    };
  }
);

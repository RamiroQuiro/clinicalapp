import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { archivosAdjuntos } from './archivosAdjuntos';
import { diagnostico } from './diagnostico';
import { historiaClinica } from './historiaClinica';
import { medicamento } from './medicamento';
import { notasMedicas } from './notasMedicas';
import { pacientes } from './pacientes';
import { signosVitales } from './signosVitales';
import { users } from './users';

export const atenciones = sqliteTable('atenciones', {
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
  sintomas: text('sintomas', { mode: 'text' }),
  tratamientoId: text('tratamientoId'),
  tratamiento: text('tratamiento'),
  planSeguir: text('planSeguir'),
  motivoInicial: text('motivoInicial'),
  observaciones: text('observaciones'),
  estado: text('estado', { enum: ['pendiente', 'en_curso', 'enAtencion', 'finalizada'] }).default(
    'pendiente'
  ),
  inicioConsulta: integer('inicioConsulta', { mode: 'timestamp' }),
  finConsulta: integer('finConsulta', { mode: 'timestamp' }),
  duracionConsulta: integer('duracionConsulta', { mode: 'number' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

// --- RELACIONES ---
export const atencionesRelations = relations(atenciones, ({ one, many }) => ({
  paciente: one(pacientes, {
    fields: [atenciones.pacienteId],
    references: [pacientes.id],
  }),
  medico: one(users, {
    fields: [atenciones.userIdMedico],
    references: [users.id],
  }),
  diagnosticos: many(diagnostico),
  medicamentos: many(medicamento),
  notas: many(notasMedicas),
  archivos: many(archivosAdjuntos),
  signosVitales: one(signosVitales, {
    fields: [atenciones.id],
    references: [signosVitales.atencionId],
  }),
}));

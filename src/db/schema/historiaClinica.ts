import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { pacientes } from './pacientes';

export const historiaClinica = sqliteTable(
  'historiaClinica',
  {
    id: text('id').primaryKey(),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id, { onDelete: 'cascade' }),
    centroMedicoId: text('centroMedicoId')
      .notNull()
      .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    numeroHC: text('numeroHC').notNull(),
    email: text('email'),
    celular: text('celular'),
    domicilio: text('domicilio'),
    ciudad: text('ciudad'),
    provincia: text('provincia'),
    pais: text('pais'),
    obraSocial: text('obraSocial'),
    nObraSocial: text('nObraSocial'),
    grupoSanguineo: text('grupoSanguineo', {
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    }),
    alergias: text('alergias', { mode: 'json' })
      .$type<
        Array<{
          sustancia: string;
          reaccion: string;
          severidad: 'leve' | 'moderada' | 'grave';
          fechaDiagnostico?: string;
          activa: boolean;
        }>
      >()
      .default([]), // ["penicilina", "mariscos"]
    medicacionesCronicas: text('medicacionesCronicas', { mode: 'json' })
      .$type<
        Array<{
          nombreComercial: string;
          nombreGenerico: string;
          dosis: string;
          frecuencia: string;
          via: string;
          fechaInicio?: string;
          fechaFin?: string;
          activa: boolean;
        }>
      >()
      .default([]),
    cirugiasPrevias: text('cirugiasPrevias', { mode: 'json' })
      .$type<
        Array<{
          procedimiento: string;
          fecha: string;
          tipo: string;
          lugar?: string;
          profesional?: string;
          resultado?: string;
          complicaciones: string;
        }>
      >()
      .default([]),
    estado: text('estado', {
      enum: ['activa', 'archivada', 'transferida', 'baja'],
    }).default('activa'),
    observaciones: text('observaciones'),
    fechaApertura: integer('fechaApertura', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    fechaBaja: integer('fechaBaja', { mode: 'timestamp' }),
    motivoBaja: text('motivoBaja'),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
  },
  table => {
    return {
      // 🔍 ÍNDICES CRÍTICOS:

      // Búsqueda por paciente + centro (más común)
      pacienteCentroIdx: sql`INDEX idx_hc_paciente_centro ON historiaClinica(${table.pacienteId}, ${table.centroMedicoId})`,

      // Búsqueda por número de HC
      numeroHCIdx: sql`INDEX idx_hc_numero ON historiaClinica(${table.numeroHC})`,

      // Búsqueda por estado
      estadoIdx: sql`INDEX idx_hc_estado ON historiaClinica(${table.estado})`,

      // Número único por centro médico
      uniqueNumeroCentro: sql`UNIQUE (${table.numeroHC}, ${table.centroMedicoId})`,
    };
  }
);

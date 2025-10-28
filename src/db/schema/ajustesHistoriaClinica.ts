import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

export const ajustesHistoriaClinica = sqliteTable('ajustesHistoriaClinica', {
  id: text('id').primaryKey(),
  centroMedicoId: text('centroMedicoId').notNull().references(() => centrosMedicos.id),
  seccionNotasAdicionales: integer('seccionNotasAdicionales', { mode: 'boolean' }).default(true),
});

export const camposPersonalizadosHC = sqliteTable('camposPersonalizadosHC', {
  id: text('id').primaryKey(),
  ajustesHistoriaClinicaId: text('ajustesHistoriaClinicaId').references(() => ajustesHistoriaClinica.id),
  nombre: text('nombre').notNull(),
  tipo: text('tipo', { enum: ['texto', 'numero', 'fecha', 'booleano'] }).notNull(),
  valorPorDefecto: text('valorPorDefecto'),
  seccion: text('seccion').notNull(),
});
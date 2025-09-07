import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { historiaClinica } from './historiaClinica';
import { pacientes } from './pacientes';
import { users } from './users';

export const medicamento = sqliteTable('medicamentos', {
  id: text('id').primaryKey(),

  // PRINCIPIO ACTIVO - obligatorio
  nombreGenerico: text('nombreGenerico').notNull(),

  // OPCIONALES
  nombreComercial: text('nombreComercial'), // Ej: Amoxidal
  laboratorio: text('laboratorio'), // Ej: Roemmers
  descripcion: text('descripcion'), // Observaciones libres
  tipoMedicamento: text('tipoMedicamento'), // Ej: Antibiótico, Analgésico

  // RELACIONES
  historiaClinicaId: text('historiaClinicaId').references(() => historiaClinica.id, {
    onDelete: 'cascade',
  }),
  atencionId: text('atencionId').references(() => atenciones.id, { onDelete: 'cascade' }),
  pacienteId: text('pacienteId').references(() => pacientes.id, { onDelete: 'cascade' }),
  userMedicoId: text('userMedicoId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  updateUserId: text('updateUserId').references(() => users.id, { onDelete: 'cascade' }),
  // POSOLOGÍA
  dosis: text('dosis'),
  frecuencia: text('frecuencia'),
  duracion: text('duracion'),
  estado: text('estado', { enum: ['activo', 'pendiente', 'finalizado'] }).default('activo'),
  // STOCK Y COSTO
  precio: text('precio'),
  stock: text('stock'),

  // CONTROL DE FECHAS
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

// --- RELACIONES ---
export const medicamentoRelations = relations(medicamento, ({ one }) => ({
  atencion: one(atenciones, {
    fields: [medicamento.atencionId],
    references: [atenciones.id],
  }),
}));

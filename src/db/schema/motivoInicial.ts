import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const motivosIniciales = sqliteTable('motivosIniciales', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(), // ej: "Dolor de cabeza"
  categoria: text('categoria'), // ej: "Síntoma", "Control", "Prevención"
  descripcion: text('descripcion'), // opcional, más detalle
  creadoPorId: text('creado_por_id').references(() => users.id), // Quién lo creó (puede ser secretaria)
  centroMedicoId: text('centroMedicoId').references(() => centrosMedicos.id), // me sirve para sacar estadisticas del centro medico
  medicoId: text('medico_id').references(() => users.id), // 
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

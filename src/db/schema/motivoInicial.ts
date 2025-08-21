import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const motivosIniciales = sqliteTable('motivosIniciales', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(), // ej: "Dolor de cabeza"
  categoria: text('categoria'), // ej: "Síntoma", "Control", "Prevención"
  descripcion: text('descripcion'), // opcional, más detalle
  creadoPorId: text('creado_por_id').references(() => users.id), // Quién lo creó (puede ser secretaria)
  medicoId: text('medico_id').references(() => users.id), // Para qué médico es (opcional)
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
});

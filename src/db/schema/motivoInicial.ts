import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const motivosIniciales = sqliteTable('motivosIniciales', {
  id: text('id').primaryKey().unique(),
  nombre: text('nombre').notNull(), // ej: "Dolor de cabeza"
  categoria: text('categoria'), // ej: "Síntoma", "Control", "Prevención"
  descripcion: text('descripcion'), // opcional, más detalle
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

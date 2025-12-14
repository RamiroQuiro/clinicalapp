import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const planes = sqliteTable('planes', {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    precioMensual: integer('precioMensual').notNull(),
    diasPrueba: integer('diasPrueba').default(0),
    descripcion: text('descripcion'),
    limites: text('limites', { mode: 'json' }).notNull(), // JSON con maxProfesionales, iaEnabled, etc.
    activo: integer('activo', { mode: 'boolean' }).default(true),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';

export const motivosIniciales = sqliteTable('motivosIniciales', {
  id: text('id').primaryKey().unique(),
  nombre: text('nombre').notNull(),
  atencionId: text('atencionId').references(() => atenciones.id, { onDelete: 'cascade' }),
  categoria: text('categoria'), // Opcional para agrupar motivos
  descripcion: text('descripcion'),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

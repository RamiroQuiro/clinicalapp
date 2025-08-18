import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { tratamiento } from './tratamiento';
export const atencionTratamientos = sqliteTable('atencionTratamientos', {
  id: text('id').primaryKey().unique(),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id),
  tratamientoId: text('tratamientoId')
    .notNull()
    .references(() => tratamiento.id),
});

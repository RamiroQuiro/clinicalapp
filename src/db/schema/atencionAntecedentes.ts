import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { antecedentes } from './atecedentes';
import { atenciones } from './atenciones';

export const atencionAntecedentes = sqliteTable('atencionAntecedentes', {
  id: text('id').primaryKey().unique(),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id),
  antecedenteId: text('antecedenteId')
    .notNull()
    .references(() => antecedentes.id),
});

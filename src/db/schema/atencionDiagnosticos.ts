import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { diagnostico } from './diagnostico';

export const atencionDiagnosticos = sqliteTable('atencionDiagnosticos', {
  id: text('id').primaryKey().unique(),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id),
  diagnosticoId: text('diagnosticoId')
    .notNull()
    .references(() => diagnostico.id),
});

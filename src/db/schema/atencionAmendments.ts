import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { users } from './users';

export const atencionAmendments = sqliteTable('atencionAmendments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  atencionId: text('atencionId')
    .references(() => atenciones.id)
    .notNull(),
  userIdMedico: text('userIdMedico')
    .references(() => users.id)
    .notNull(),
  seccion: text('seccion').notNull(),
  contenidoOriginal: text('contenidoOriginal').notNull(),
  contenidoCorregido: text('contenidoCorregido').notNull(),
  justificacion: text('justificacion').notNull(),
  motivo: text('motivo'),
  tipo: text('tipo'),
  titulo: text('titulo'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

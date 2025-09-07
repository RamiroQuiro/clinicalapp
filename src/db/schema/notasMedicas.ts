import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { users } from './users';

export const notasMedicas = sqliteTable('notasMedicas', {
  id: text('id').primaryKey().unique(),
  pacienteId: text('pacienteId')
    .references(() => pacientes.id)
    .notNull(),
  userMedicoId: text('userMedicoId')
    .references(() => users.id)
    .notNull(),
  title: text('title').notNull(),
  atencionId: text('atencionId').references(() => atenciones.id),
  observaciones: text('observaciones'),
  descripcion: text('descripcion'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

// --- RELACIONES ---
export const notasMedicasRelations = relations(notasMedicas, ({ one }) => ({
  atencion: one(atenciones, {
    fields: [notasMedicas.atencionId],
    references: [atenciones.id],
  }),
}));

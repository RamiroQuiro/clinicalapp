import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { users } from './users';

export const ordenesEstudio = sqliteTable('ordenesEstudio', {
  id: text('id').primaryKey(),
  atencionId: text('atencionId')
    .notNull()
    .references(() => atenciones.id),
  pacienteId: text('pacienteId')
    .notNull()
    .references(() => pacientes.id),
  userMedicoId: text('userMedicoId')
    .notNull()
    .references(() => users.id),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  diagnosticoPresuntivo: text('diagnosticoPresuntivo').notNull(),
  estudiosSolicitados: text('estudiosSolicitados', { mode: 'json' }).$type<string[]>().notNull(),
});

export const ordenesEstudioRelations = relations(ordenesEstudio, ({ one }) => ({
  atencion: one(atenciones, {
    fields: [ordenesEstudio.atencionId],
    references: [atenciones.id],
  }),
  paciente: one(pacientes, {
    fields: [ordenesEstudio.pacienteId],
    references: [pacientes.id],
  }),
  userMedico: one(users, {
    fields: [ordenesEstudio.userMedicoId],
    references: [users.id],
  }),
}));

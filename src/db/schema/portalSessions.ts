import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { turnos } from './turnos';

export const portalSessions = sqliteTable('portal_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  // Token único y no adivinable que se le da al paciente
  token: text('token').notNull().unique(),

  // A qué turno está asociado este token
  turnoId: text('turno_id')
    .notNull()
    .references(() => turnos.id, { onDelete: 'cascade', onUpdate: 'cascade' }),

  // Fecha y hora en que el token deja de ser válido (formato timestamp UNIX)
  expired_at: integer('expired_at', { mode: 'timestamp' }).notNull(),
});

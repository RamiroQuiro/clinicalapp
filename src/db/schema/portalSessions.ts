import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { turnos } from './turnos';

export const portalSessions = sqliteTable('portal_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  
  // Token único y no adivinable que se le da al paciente
  token: text('token').notNull().unique(),
  
  // A qué turno está asociado este token
  turnoId: text('turno_id').notNull().references(() => turnos.id),
  
  // Fecha y hora en que el token deja de ser válido (formato timestamp UNIX)
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

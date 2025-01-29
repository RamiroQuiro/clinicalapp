import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const doctoresPacientes = sqliteTable('doctoresPacientes', {
  userId: text('userId').notNull(), // ID del doctor
  pacienteId: text('pacienteId').notNull(), // ID del paciente en pacientesUnicos
});

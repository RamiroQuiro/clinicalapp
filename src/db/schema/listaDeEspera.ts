import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const listaDeEspera = sqliteTable('listaDeEspera', {
  id: text('id').primaryKey(),
  pacienteId: text('pacienteId'),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  isExist: integer('isExist', { mode: 'boolean' }).default(false),
  dni: text('dni').notNull(),
  userId: text('userId').notNull(),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  orden: integer('orden'),
  hora: text('hora').notNull(),
  motivoConsulta: text('motivoConsulta').notNull(),
  estado: text('estado').default('pendiente'),
  activo: text('activo').default('true'),
});

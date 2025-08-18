import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const pacientes = sqliteTable('pacientes', {
  id: text('id').primaryKey(), // ID único del paciente
  nombre: text('nombre').notNull(), // Nombre del paciente
  apellido: text('apellido').notNull(), // Apellido del paciente
  dni: integer('dni', { mode: 'number' }).unique(), // DNI único
  email: text('email'),
  domicilio: text('domicilio'),
  sexo: text('sexo', { enum: ['masculino', 'femenino', 'otro'] }),
  edad: text('edad'),
  fNacimiento: integer('fNacimiento', { mode: 'timestamp' }) // Fecha de nacimiento
    .notNull(),
  celular: text('celular'),
  created_at: integer('created_at', { mode: 'timestamp' }) // Fecha de creación
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  activo: integer('activo', { mode: 'boolean' }).default(true),
});

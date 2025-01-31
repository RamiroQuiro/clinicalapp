import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const pacientes = sqliteTable('pacientes', {
  id: text('id').primaryKey(), // ID único del paciente
  nombre: text('nombre').notNull(), // Nombre del paciente
  apellido: text('apellido').notNull(), // Apellido del paciente
  dni: integer('dni', { mode: 'number' }).unique(), // DNI único
  domicilio: text('domicilio'),
  fNacimiento: text('fNacimiento') // Fecha de nacimiento
    .notNull()
    .default(sql`(current_timestamp)`),
  sexo: text('sexo'), // Sexo del paciente
  created_at: text('created_at') // Fecha de creación
    .notNull()
    .default(sql`(current_timestamp)`),
});

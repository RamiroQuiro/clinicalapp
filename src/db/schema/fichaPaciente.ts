import { sql } from 'drizzle-orm';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { pacientes } from './pacientes';
import { users } from './users';

export const fichaPaciente = sqliteTable('fichaPaciente', {
  id: text('id').primaryKey(), // ID único del registro
  pacienteId: text('pacienteId') // Relación con la tabla `pacientes`
    .notNull()
    .references(() => pacientes.id),
  userId: text('userId') // Relación con la tabla de doctores
    .notNull()
    .references(() => users.id),
  obraSocial: text('obraSocial'), // Obra social del paciente
  nObraSocial: text('nObraSocial'),
  historialMedico: text('historialMedico'), // Historial médico
  observaciones: text('observaciones'), // Observaciones del doctor
  email: text('email'), // Email del paciente (específico para este doctor)
  srcPhoto: text('srcPhoto'), // Foto del paciente (específica para este doctor)
  celular: text('celular'), // Celular del paciente (específico para este doctor)
  estatura: text('estatura'), // Estatura del paciente
  direccion: text('direccion'), // Dirección del paciente
  ciudad: text('ciudad'), // Ciudad del paciente
  grupoSanguineo: text('grupoSanguinieo'), // Grupo sanguíneo
  provincia: text('provincia'), // Provincia del paciente
  pais: text('pais'), // País del paciente
  updated_at: text('updated_at'), // Fecha de última actualización
  created_at: text('created_at') // Fecha de creación
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text('deleted_at'), // Fecha de eliminación (soft delete)
});

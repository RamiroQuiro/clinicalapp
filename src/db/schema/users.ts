import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().unique(),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  mp: text('mp'),
  especialidad: text('especialidad'),
  rol: text('rol', {
    enum: [
      'superadmin', // opcional: control total del sistema (ramaCode, tuyo)
      'admin', // administra un centro médico (contrata el servicio)
      'profesional', // médico, kinesiólogo, odontólogo, etc.
      'recepcionista',
      'dataEntry', // carga historias, fichas o datos
      'reader', // solo lectura (auditorías, becarios, etc.)
    ],
  }),
  emailVerificado: integer('emailVerificado', { mode: 'boolean' }).default(false),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  apellido: text('apellido').notNull(),
  password: text('password').notNull(),
  documento: text('documento'), // en caso de ser necesario un numero de documento especifico
  cuil: text('cuil'),
  cuit: text('cuit'),
  telefono: text('telefono'),
  dni: integer('dni', { mode: 'number' }),
  srcPhoto: text('srcPhoto'),
  celular: text('celular'),
  direccion: text('direccion'),
  ciudad: text('ciudad'),
  provincia: text('provincia'),
  pais: text('pais'),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

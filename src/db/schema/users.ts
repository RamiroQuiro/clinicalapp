import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';

export const users = sqliteTable('users', {
  id: text('id').primaryKey().unique(),
  email: text('email').notNull().unique(),
  nombre: text('nombre').notNull(),
  rol: text('rol', { enum: ['admin', 'secretario', 'dataEntry', 'reader'] }),
  emailVerificado: integer('emailVerificado', { mode: 'boolean' }).default(false),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  apellido: text('apellido').notNull(),
  password: text('password').notNull(),
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

// --- RELACIONES ---
export const usersRelations = relations(users, ({ many }) => ({
  atenciones: many(atenciones),
}));

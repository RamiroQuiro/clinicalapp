import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const usersCentrosMedicos = sqliteTable('usersCentrosMedicos', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  esProfesional: integer('esProfesional', { mode: 'boolean' }).default(false),
  centroMedicoId: text('centroMedicoId')
    .references(() => centrosMedicos.id, { onDelete: 'cascade' })
    .notNull(),
  emailUser: text('emailUser'),
  nombreCentroMedico: text('nombreCentroMedico').notNull(),
  rolEnCentro: text('rolEnCentro', {
    enum: ['profesional', 'recepcion', 'adminLocal', 'admin', 'administrativo', 'dataEntry', 'reader'],
  }).notNull(),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
},
  (t) => [[unique().on(t.userId, t.centroMedicoId)],]
);

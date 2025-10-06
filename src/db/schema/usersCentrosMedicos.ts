import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const usersCentrosMedicos = sqliteTable('usersCentrosMedicos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId')
    .references(() => users.id)
    .notNull(),
  centroMedicoId: integer('centroMedicoId')
    .references(() => centrosMedicos.id)
    .notNull(),
  nombreCentroMedico: text('nombreCentroMedico').notNull(),
  rolEnCentro: text('rolEnCentro', {
    enum: ['profesional', 'recepcion', 'adminLocal'],
  }).notNull(),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

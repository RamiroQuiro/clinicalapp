import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const usersCentrosMedicos = sqliteTable('usersCentrosMedicos', {
  id: integer('id').primaryKey(),
  userId: text('userId')
    .references(() => users.id)
    .notNull(),
  centroMedicoId: text('centroMedicoId')
    .references(() => centrosMedicos.id)
    .notNull(),
  emailUser: text('emailUser'),
  nombreCentroMedico: text('nombreCentroMedico').notNull(),
  rolEnCentro: text('rolEnCentro', {
    enum: ['profesional', 'recepcion', 'adminLocal'],
  }).notNull(),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
},
  (t) => [[unique().on(t.userId, t.centroMedicoId)],]
);

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { pacientes } from './pacientes';
import { users } from './users';
import { usersCentrosMedicos } from './usersCentrosMedicos';

export const pacienteProfesional = sqliteTable(
  'pacienteProfesional',
  {
    id: text('id').primaryKey(),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id),
    userId: text('userId')
      .notNull()
      .references(() => users.id),
    centroMedicoId: text('centroMedicoId')
      .notNull()
      .references(() => usersCentrosMedicos.id),
    estado: text('estado').default('activo'), // activo, inactivo, derivado, etc.
    create_at: integer('create_at', { mode: 'timestamp' }).default(sql`(strftime('%s','now'))`),
    update_at: integer('update_at', { mode: 'timestamp' }).default(sql`(strftime('%s','now'))`),
    delete_at: integer('delete_at', { mode: 'timestamp' }),
  },
  t => [unique().on(t.pacienteId, t.userId)]
);

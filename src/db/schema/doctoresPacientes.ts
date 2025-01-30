import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { pacientes } from './pacientes';
import { users } from './users';

export const doctoresPacientes = sqliteTable(
  'doctoresPacientes',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id),
  },
  table => ({
    primaryKey: primaryKey({ columns: [table.userId, table.pacienteId] }),
  })
);

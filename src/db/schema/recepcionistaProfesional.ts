import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const recepcionistaProfesional = sqliteTable(
  'recepcionistaProfesional',
  {
    id: text('id').primaryKey(),

    // Receptionist's user ID
    recepcionistaId: text('recepcionistaId')
      .references(() => users.id)
      .notNull(),

    // Professional's user ID
    profesionalId: text('profesionalId')
      .references(() => users.id)
      .notNull(),

    // Medical center where this relationship is valid
    centroMedicoId: integer('centroMedicoId')
      .references(() => centrosMedicos.id)
      .notNull(),

    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  },
  table => {
    return {
      // Primary key
      pk: sql`PRIMARY KEY (${table.recepcionistaId}, ${table.profesionalId}, ${table.centroMedicoId})`,

      // Indexes
      recepcionistaIdx: sql`INDEX recepcionista_idx ON ${table}(${table.recepcionistaId})`,
      profesionalIdx: sql`INDEX profesional_idx ON ${table}(${table.profesionalId})`,
      centroMedicoIdx: sql`INDEX centro_medico_idx ON ${table}(${table.centroMedicoId})`,
    };
  }
);

export type RecepcionistaProfesional = typeof recepcionistaProfesional.$inferSelect;
export type NewRecepcionistaProfesional = typeof recepcionistaProfesional.$inferInsert;

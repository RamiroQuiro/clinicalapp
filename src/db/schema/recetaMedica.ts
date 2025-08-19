import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { users } from './users';

export const recetaMedica = sqliteTable('recetaMedica', {
  id: text('id').primaryKey().unique(),
  atencionId: integer('atencionId')
    .notNull()
    .references(() => atenciones.id, { onDelete: 'cascade' }),
  pacienteId: integer('pacienteId')
    .notNull()
    .references(() => pacientes.id, { onDelete: 'cascade' }),
  userMecidoId: integer('userMecidoId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  medicamentos: text('medicamentos').notNull(),
  nombreComercial: text('nombreComercial'),
  nombreGenerico: text('nombreGenerico'),
  fecha: integer('fecha', { mode: 'timestamp' }).notNull(),
  observaciones: text('observaciones'),
  horarios: text('horarios'),
  indicaciones: text('indicaciones'),
  dosis: text('dosis'),
  cantidad: text('cantidad'),
  activo: integer('activo', { mode: 'boolean' }).default(true),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

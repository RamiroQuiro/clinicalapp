import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { historiaClinica } from './historiaClinica';
import { pacientes } from './pacientes';
import { users } from './users';

export const medicamento = sqliteTable('medicamentos', {
  id: text('id').primaryKey(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  historiaClinicaId: text('historiaClinicaId').references(() => historiaClinica.id, {
    onDelete: 'cascade',
  }),
  atencionId: text('atencionId').references(() => atenciones.id, { onDelete: 'cascade' }),
  pacienteId: text('pacienteId').references(() => pacientes.id, { onDelete: 'cascade' }),
  userMedicoId: text('userMedicoId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  dosis: text('dosis'),
  frecuencia: text('frecuencia'),
  duracion: text('duracion'),
  precio: text('precio'),
  stock: text('stock'),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

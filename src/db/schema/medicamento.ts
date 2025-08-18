import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const medicamento = sqliteTable('medicamentos', {
  id: text('id').primaryKey().unique(),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  historiaClinicaId: text('historiaClinicaId'),
  atencionId: text('atencionId').notNull(),
  pacienteId: text('pacienteId').notNull(),
  userId: text('userId').notNull(),
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

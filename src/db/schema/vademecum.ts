import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { users } from './users'; // Asumiendo que tienes una tabla de usuarios
import { centrosMedicos } from './centrosMedicos'; // Asumiendo que tienes una tabla de centros médicos

export const vademecum = sqliteTable(
  'vademecum',
  {
    id: text('id').primaryKey(),
    nombreGenerico: text('nombre_generico').notNull(),
    nombreComercial: text('nombre_comercial'),
    presentacion: text('presentacion'),
    dosisComun: text('dosis_comun'),
    viaAdministracion: text('via_administracion'),
    creadoPorId: text('creado_por_id').references(() => users.id, { onDelete: 'set null' }),
    centroMedicoId: text('centro_medico_id').references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => ({
    unq: unique('nombre_generico_centro_medico').on(t.nombreGenerico, t.centroMedicoId),
  })
);

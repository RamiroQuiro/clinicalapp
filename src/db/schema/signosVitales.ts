import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const signosVitales = sqliteTable('signosVitales', {
  id: text('id').primaryKey().unique(),
  historiaClinicaId: text('historiaClinicaId'),
  atencionId: text('atencionId').notNull(),
  pacienteId: text('pacienteId').notNull(),
  userId: text('userId').notNull(),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
  created_at: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  temperatura: text('temperatura'),
  pulso: text('pulso'),
  respiracion: text('respiracion'),
  tensionArterial: text('tensionArterial'),
  saturacionOxigeno: text('saturacionOxigeno'),
  glucosa: text('glucosa'),
  peso: text('peso'),
  talla: text('talla'),
  imc: text('imc'),
  frecuenciaCardiaca: text('frecuenciaCardiaca'),
  frecuenciaRespiratoria: text('frecuenciaRespiratoria'),
  dolor: text('dolor'),
});

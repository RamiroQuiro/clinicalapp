import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { atenciones } from './atenciones';
import { pacientes } from './pacientes';
import { users } from './users';

export const signosVitales = sqliteTable(
  'signosVitales',
  {
    id: text('id').primaryKey(),
    historiaClinicaId: text('historiaClinicaId'),
    atencionId: text('atencionId')
      .notNull()
      .references(() => atenciones.id, { onDelete: 'cascade' }),
    pacienteId: text('pacienteId')
      .notNull()
      .references(() => pacientes.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
    temperatura: integer('temperatura'),
    pulso: integer('pulso'),
    respiracion: integer('respiracion'),
    presionArterial: integer('presionArterial'),
    tensionArterial: integer('tensionArterial'),
    saturacionOxigeno: integer('saturacionOxigeno'),
    glucosa: integer('glucosa'),
    peso: integer('peso'),
    talla: integer('talla'),
    imc: integer('imc'),
    frecuenciaCardiaca: integer('frecuenciaCardiaca'),
    frecuenciaRespiratoria: integer('frecuenciaRespiratoria'),
    dolor: integer('dolor'),
    fechaRegistro: integer('fechaRegistro', { mode: 'timestamp' }),
  },
  t => [
    // Único para DNI y empresa
    unique().on(t.atencionId, t.pacienteId),
  ]
);

// --- RELACIONES ---
export const signosVitalesRelations = relations(signosVitales, ({ one }) => ({
  atencion: one(atenciones, {
    fields: [signosVitales.atencionId],
    references: [atenciones.id],
  }),
}));

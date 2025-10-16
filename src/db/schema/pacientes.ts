import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

export const pacientes = sqliteTable(
  'pacientes',
  {
    id: text('id').primaryKey(),
    nombre: text('nombre').notNull(),
    apellido: text('apellido').notNull(),
    dni: integer('dni', { mode: 'number' }).notNull(),
    centroMedicoId: text('centroMedicoId')
      .notNull()
      .references(() => centrosMedicos.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    email: text('email'),
    celular: text('celular'),
    domicilio: text('domicilio'),
    sexo: text('sexo', { enum: ['masculino', 'femenino', 'otro'] }).notNull(),
    fNacimiento: integer('fNacimiento', { mode: 'timestamp' }).notNull(),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
    activo: integer('activo', { mode: 'boolean' }).default(true),
  },
  t => ({
    dniCentroUnique: uniqueIndex('idx_dni_centro').on(t.dni, t.centroMedicoId),
    centroMedicoIdx: index('idx_centro_medico').on(t.centroMedicoId),
    nombreApellidoIdx: index('idx_nombre_apellido').on(t.nombre, t.apellido),
    dniIdx: index('idx_dni').on(t.dni),
    activosCentroIdx: sql`CREATE INDEX idx_activos_centro ON pacientes(${t.centroMedicoId}, ${t.activo}) WHERE ${t.activo} = 1`,
  })
);

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { planes } from './planes';

export const suscripciones = sqliteTable('suscripciones', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centroMedicoId')
        .references(() => centrosMedicos.id, { onDelete: 'cascade' })
        .notNull(),
    planId: text('planId')
        .references(() => planes.id)
        .notNull(),
    estado: text('estado', {
        enum: ['activa', 'cancelada', 'impaga', 'prueba'],
    }).default('prueba').notNull(),
    fechaInicio: integer('fechaInicio', { mode: 'timestamp' }).notNull(),
    fechaFin: integer('fechaFin', { mode: 'timestamp' }), // Puede ser null si es vitalicio, pero en SaaS suele tener vencimiento
    renovacionAutomatica: integer('renovacionAutomatica', { mode: 'boolean' }).default(true),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
});

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { suscripciones } from './suscripciones';

export const pagosSuscripciones = sqliteTable('pagos_suscripciones', {
    id: text('id').primaryKey(),
    suscripcionId: text('suscripcionId')
        .references(() => suscripciones.id)
        .notNull(),
    monto: integer('monto').notNull(),
    fechaPago: integer('fechaPago', { mode: 'timestamp' }).notNull(),
    metodoPago: text('metodoPago', {
        enum: ['transferencia', 'mercadopago', 'tarjeta', 'efectivo', 'bonificado'],
    }).notNull(),
    referenciaExterna: text('referenciaExterna'), // ID de MP o comprobante
    estado: text('estado', {
        enum: ['aprobado', 'pendiente', 'rechazado'],
    }).default('pendiente').notNull(),
    comprobanteUrl: text('comprobanteUrl'),
    created_at: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

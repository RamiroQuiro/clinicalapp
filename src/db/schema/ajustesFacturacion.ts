import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

export const ajustesFacturacion = sqliteTable('ajustesFacturacion', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centro_medico_id').notNull().references(() => centrosMedicos.id),
    razonSocial: text('razon_social'),
    cuit: text('cuit'),
});

export const aranceles = sqliteTable('aranceles', {
    id: text('id').primaryKey(),
    ajustesFacturacionId: text('ajustesFacturacionId').references(() => ajustesFacturacion.id),
    nombre: text('nombre').notNull(),
    precio: integer('precio').notNull(),
    descripcion: text('descripcion'),
});
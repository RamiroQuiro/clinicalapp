import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

export const plantillas = sqliteTable('plantillas', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centroMedicoId').notNull().references(() => centrosMedicos.id),
    nombre: text('nombre').notNull(),
    tipo: text('tipo', { enum: ['receta', 'derivacion', 'certificado', 'orden_estudio', 'informe'] }).notNull(),
    contenido: text('contenido').notNull(), // Puede ser HTML o Markdown
    esDefault: integer('esDefault', { mode: 'boolean' }).default(false),
    createdAt: text('createdAt').notNull(),
    updatedAt: text('updatedAt').notNull(),
});
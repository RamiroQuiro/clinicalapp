import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const turnos=sqliteTable('turnos',{
    id:text('id').primaryKey().unique(),
    pacienteId:text('pacienteId').notNull(),
    usuarioId:text('usuarioId').notNull(),
    fecha:text('fecha').notNull(),
    hora:text('hora').notNull(),
    motivoConsulta:text('motivoConsulta').notNull(),
    activo: integer('activo',{mode:'boolean'}).default(true),
})
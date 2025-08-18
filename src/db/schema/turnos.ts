import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const turnos=sqliteTable('turnos',{
    id:text('id').primaryKey().unique(),
    pacienteId:text('pacienteId').notNull(),
    userId:text('userId').notNull(),
    fecha: integer("fecha", { mode: "timestamp" }).notNull(),
    hora:text('hora').notNull(),
    motivoConsulta:text('motivoConsulta').notNull(),
    activo: integer('activo',{mode:'boolean'}).default(true),
})
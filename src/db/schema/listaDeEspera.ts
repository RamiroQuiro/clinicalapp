import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const listaDeEspera=sqliteTable('listaDeEspera',{
    id:text('id').primaryKey().unique(),
    pacienteId:text('pacienteId').notNull(),
    userId:text('userId').notNull(),
    fecha:text('fecha').notNull(),
    hora:text('hora').notNull(),
    orden:integer('orden',{mode:'number'}),
    estado:text('estado').default('pendiente'),
    motivoConsulta:text('motivoConsulta').notNull(),
    activo: integer('activo',{mode:'boolean'}).default(true),
})
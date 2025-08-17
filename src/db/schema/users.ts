import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users=sqliteTable("users",{
    id:text('id').primaryKey().unique(),
    email:text('email').notNull().unique(),
    nombre:text('nombre').notNull(),
    apellido:text('apellido').notNull(),
    password:text('password').notNull(),
    dni:integer('dni',{mode:'number'}),
    srcPhoto:text('srcPhoto'),
    celular:text('celular'),
    direccion:text('direccion'),
    ciudad:text('ciudad'),
    provincia:text('provincia'),
    pais:text('pais'),
    created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    
})
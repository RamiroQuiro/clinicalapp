import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medicamentos= sqliteTable('medicamentos',{
    id:text('id').primaryKey().unique(),
    nombre:text('nombre').notNull(),
    descripcion:text('descripcion').notNull(),
    precio:text('precio').notNull(),
    stock:text('stock').notNull(),
    updated_at:text('updated_at'),
    created_at:text('created_at').notNull().default(sql`(current_timestamp)`),
    deleted_at:text('deleted_at')
})
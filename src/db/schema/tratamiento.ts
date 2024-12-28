import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/mysql-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const tratamiento= sqliteTable('tratamiento',{
    id:text('id').primaryKey().unique(),
    tratamiento:text('tratamieento').notNull(),
    descripcion:text('descripcion'),
    historiaClinicaId:text('historiaClinicaId').notNull(),
    pacienteId:text('pacienteId').notNull(),
    userId:text('userId').notNull(),
    duracion:text('duracion'),
    updated_at:text('updated_at'),
    created_at:text('created_at').notNull().default(sql`(current_timestamp)`),
    deleted_at:text('deleted_at')
})
import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const diagnostico=sqliteTable('diagnostico',{
    id:text('id').primaryKey().unique(),
    nombre:text('nombre').notNull(),
    historiaClinicaId:text('historiaClinicaId').notNull(),
    pacienteId:text('pacienteId').notNull(),
    userId:text('userId').notNull(),
    observaciones:text('observaciones').notNull(),
    tratamiento:text('tratamiento').notNull(),
    updated_at:text('updated_at'),
    created_at:text('created_at').notNull().default(sql`(current_timestamp)`),
    deleted_at:text('deleted_at')   
}
)
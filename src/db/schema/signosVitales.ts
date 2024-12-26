import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signosVitales=sqliteTable('signosVitales',{
    id:text('id').primaryKey().unique(),
    historiaClinicaId:text('historiaClinicaId').notNull(),
    pacienteId:text('pacienteId').notNull(),
    userId:text('userId').notNull(),
    updated_at:text('updated_at'),
    created_at:text('created_at').notNull().default(sql`(current_timestamp)`),
    deleted_at:text('deleted_at'),
    temperatura:text('temperatura').notNull(),
    pulso:text('pulso').notNull(),
    respiracion:text('respiracion').notNull(),
    tensionArterial:text('tensionArterial').notNull(),
    saturacionOxigeno:text('saturacionOxigeno').notNull(),
    glucosa:text('glucosa').notNull(),
    peso:text('peso').notNull(),
    talla:text('talla').notNull(),
    imc:text('imc').notNull(),
    frecuenciaCardiaca:text('frecuenciaCardiaca').notNull(),
    frecuenciaRespiratoria:text('frecuenciaRespiratoria').notNull(),
    dolor:text('dolor').notNull(),
    
}
)
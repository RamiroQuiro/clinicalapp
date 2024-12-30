import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/mysql-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const antecedente = sqliteTable("antecedente", {
    id: text("id").primaryKey().unique(),
    pacienteId: text("pacienteId").notNull(), // Relación con el paciente
    tipo: text("tipo").notNull(), // Ejemplo: "Personal", "Familiar", "Hábitos"
    descripcion: text("descripcion").notNull(),
    observaciones: text("observaciones"),
    created_at: text("created_at").default(sql`(current_timestamp)`),
  });
  
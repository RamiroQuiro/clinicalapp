import { sql } from "drizzle-orm";
import { text } from "drizzle-orm/mysql-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { FileChartColumn } from "lucide-react";

export const antecedente = sqliteTable("antecedente", {
    id: text("id").primaryKey().unique(),
    antecedente:text('antecedente').notNull(),
    pacienteId: text("pacienteId").notNull(), // Relación con el paciente
    tipo: text("tipo").notNull(), // Ejemplo: "Personal", "Familiar", "Hábitos"
    descripcion: text("descripcion"),
    observaciones: text("observaciones"),
    condicion:text('condicion'),
    estado:text('estado'),
    fechaDiagnostico:text("fechaDiagnostico").default(sql`(current_timestamp)`),
    created_at: text("created_at").default(sql`(current_timestamp)`),
  });
  
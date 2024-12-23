import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recetaMedica = sqliteTable("recetaMedica", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull(),
  medicoId: text("medicoId").notNull(),
  medicamentos: text("medicamentos").notNull(),
  fecha: text("fecha").notNull(),
  observaciones: text("observaciones"),
  horarios:text('horarios'),
  cantiada:text('cantidad'),
  activo: integer("activo", { mode: "boolean" }).default(true),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updated_at: text("updated_at"),
  deleted_at: text("deleted_at"),
});

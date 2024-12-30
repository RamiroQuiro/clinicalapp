import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const historiaClinica = sqliteTable("historiaClinica", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull(),
  fecha: text("fecha").notNull(),
  userId: text("userId").notNull(),
  motivoConsulta: text("motivoConsulta"),
  diagnosticoId: text("diagnosticoId"),
  antecedenteId:text('antecedenteId'),
  tratamientoId: text("tratamientoId"),
  estado: text("estado").default("pediente"),
  observaciones: text("observaciones"),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
});

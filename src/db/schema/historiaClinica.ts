import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const historiaClinica = sqliteTable("historiaClinica", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull(),
  fecha: text("fecha").notNull(),
  userId:text('userId').notNull(),
  motivoConsulta:text('motivoConsulta').notNull(),
  diagnostico:text('diagnostico').notNull(),
  tratamiento:text('tratamiento').notNull(),
  observaciones:text('observaciones').notNull(),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
});

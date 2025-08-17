import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const recetaMedica = sqliteTable("recetaMedica", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull(),
  medicoId: text("medicoId").notNull(),
  medicamentos: text("medicamentos").notNull(),
  fecha: integer("fecha", { mode: "timestamp" }).notNull(),
  observaciones: text("observaciones"),
  horarios:text('horarios'),
  cantiada:text('cantidad'),
  activo: integer("activo", { mode: "boolean" }).default(true),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updated_at: integer("updated_at", { mode: "timestamp" }),
  deleted_at: integer("deleted_at", { mode: "timestamp" }),
});

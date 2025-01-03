import { sql } from "drizzle-orm";
import {  sqliteTable, text } from "drizzle-orm/sqlite-core";

export const notasMedicas = sqliteTable("notasMedicas", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull(),
  userId: text("userId").notNull(),
  observaciones: text("observaciones"),
  descripcion:text('descripcion'),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updated_at: text("updated_at"),
  deleted_at: text("deleted_at"),
});

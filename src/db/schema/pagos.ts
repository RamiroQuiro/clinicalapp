import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real, int } from "drizzle-orm/sqlite-core";

export const pagos = sqliteTable("pagos", {
  id: integer("id").primaryKey(),
  monto: integer("monto", { mode: "number" }).notNull(),
  fechaPago: text("fechaPago").notNull(),
  pacienteId: text("pacienteId").notNull(),
  userId: text("userId").notNull(),
  metodoPago: text("metodoPago").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

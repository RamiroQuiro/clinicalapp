import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real, int } from "drizzle-orm/sqlite-core";

export const pagos = sqliteTable("pagos", {
  id: integer("id").primaryKey(),
  monto: integer("monto", { mode: "number" }).notNull(),
  fechaPago: integer("fechaPago", { mode: "timestamp" }).notNull(),
  pacienteId: text("pacienteId").notNull(),
  userId: text("userId").notNull(),
  metodoPago: text("metodoPago").notNull(),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

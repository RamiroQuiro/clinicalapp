import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const medicamento = sqliteTable("medicamentos", {
  id: text("id").primaryKey().unique(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  historiaClinicaId: text("historiaClinicaId").notNull(),
  pacienteId: text("pacienteId").notNull(),
  userId: text("userId").notNull(),
  dosis: text("dosis"),
  frecuencia: text("frecuencia"),
  duracion: text("duracion"),
  precio: text("precio"),
  stock: text("stock"),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
});

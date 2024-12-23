import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const pacientes = sqliteTable("pacientes", {
  id: text("id").primaryKey().unique(),
  email: text("email").notNull().unique(),
  nombre: text("nombre").notNull(),
  userId: text("userId").notNull(),
  apellido: text("apellido").notNull(),
  dni: integer("dni", { mode: "number" }),
  srcPhoto: text("srcPhoto"),
  celular: text("celular"),
  direccion: text("direccion"),
  ciudad: text("ciudad"),
  provincia: text("provincia"),
  pais: text("pais"),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
});

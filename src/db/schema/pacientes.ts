import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const pacientes = sqliteTable("pacientes", {
  id: text("id").primaryKey().unique(),
  nombre: text("nombre").notNull(),
  userId: text("userId").notNull(),
  apellido: text("apellido").notNull(),
  dni: integer("dni", { mode: "number" }).unique(),
  email: text("email"),
  fNacimiento:text('fNacimiento').notNull().default(sql`(current_timestamp)`),
  srcPhoto: text("srcPhoto"),
  celular: text("celular"),
  sexo:text('sexo'),
  direccion: text("direccion"),
  ciudad: text("ciudad"),
  grupoSanguineo:text('grupoSanguinieo'),
  provincia: text("provincia"),
  pais: text("pais"),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
});

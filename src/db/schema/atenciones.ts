import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { pacientes } from "./pacientes";

export const atenciones = sqliteTable("atenciones", {
  id: text("id").primaryKey().unique(),
  pacienteId: text("pacienteId").notNull().references(()=>pacientes.id),
  fecha: text("fecha").notNull(),
  userId: text("userId").notNull(),
  motivoConsulta: text("motivoConsulta"),
  motivoInicial:text('motivoInicial').notNull(),
  diagnosticoId: text("diagnosticoId"),//varios diagnostios
  antecedenteId:text('antecedenteId'),//varios antecedentes
  tratamientoId: text("tratamientoId"),
  tratamiento:text('tratamiento'),
  estado: text("estado").default("pediente"),
  observaciones: text("observaciones"),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
  inicioAtencion: text("inicioAtencion"), // Nuevo: Hora de inicio
  finAtencion: text("finAtencion"),       // Nuevo: Hora de fin
  duracionAtencion: text("duracionAtencion"), // Nuevo: Duración total
  
});

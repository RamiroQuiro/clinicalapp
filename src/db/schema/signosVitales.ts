import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const signosVitales = sqliteTable("signosVitales", {
  id: text("id").primaryKey().unique(),
  historiaClinicaId: text("historiaClinicaId").notNull(),
  pacienteId: text("pacienteId").notNull(),
  userId: text("userId").notNull(),
  updated_at: text("updated_at"),
  created_at: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  deleted_at: text("deleted_at"),
  temperatura: text("temperatura"),
  pulso: text("pulso"),
  respiracion: text("respiracion"),
  tensionArterial: text("tensionArterial"),
  saturacionOxigeno: text("saturacionOxigeno"),
  glucosa: text("glucosa"),
  peso: text("peso"),
  talla: text("talla"),
  imc: text("imc"),
  frecuenciaCardiaca: text("frecuenciaCardiaca"),
  frecuenciaRespiratoria: text("frecuenciaRespiratoria"),
  dolor: text("dolor"),
});

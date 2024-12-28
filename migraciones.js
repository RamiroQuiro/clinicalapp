import { sql } from 'drizzle-orm';
import db from './db';

// Crear la tabla si no existe
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS medicamentos (
    id TEXT PRIMARY KEY UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    historiaClinicaId TEXT NOT NULL,
    pacienteId TEXT NOT NULL,
    userId TEXT NOT NULL,
    dosis TEXT,
    frecuencia TEXT,
    duracion TEXT,
    precio TEXT,
    stock TEXT,
    updated_at TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
    deleted_at TEXT
  );
`;

// Actualizar la tabla existente (verifica si las columnas no existen antes de agregar)
const updateTableSQL = [
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS dosis TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS frecuencia TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS duracion TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS precio TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS stock TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS updated_at TEXT;`,
  `ALTER TABLE medicamentos ADD COLUMN IF NOT EXISTS deleted_at TEXT;`
];

// Función para ejecutar las migraciones
async function runMigrations() {
  try {
    await db.run(createTableSQL);
    for (const sql of updateTableSQL) {
      await db.run(sql);
    }
    console.log("Migraciones ejecutadas exitosamente.");
  } catch (error) {
    console.error("Error ejecutando las migraciones:", error);
  }
}

// Ejecutar las migraciones
runMigrations();

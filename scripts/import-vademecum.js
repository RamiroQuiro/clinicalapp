import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { vademecum } from '../src/db/schema/vademecum.ts';

// --- Configuración ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const csvDir = path.join(projectRoot, 'public', 'vademecum');

console.log('Iniciando el script de importación de Vademecum (v4 - autónomo)...');

// --- Conexión a DB independiente ---
const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_DB_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error('Error: Credenciales de Turso no encontradas en las variables de entorno.');
  console.error('Asegúrate de que TURSO_DB_URL y TURSO_DB_AUTH_TOKEN estén definidas.');
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

const db = drizzle(client, { schema: { vademecum } });

async function main() {
  try {
    const files = fs.readdirSync(csvDir).filter((file) => file.endsWith('.csv'));
    if (files.length === 0) {
      console.log('No se encontraron archivos CSV en el directorio:', csvDir);
      return;
    }
    console.log(`Se encontraron ${files.length} archivos CSV para procesar.`);

    let allMedicamentos = [];

    for (const file of files) {
      const filePath = path.join(csvDir, file);
      const fileContent = fs.readFileSync(filePath, 'latin1');
      const lines = fileContent.split('\n');

      let headerIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toUpperCase().includes('LABORATORIO TITULAR')) {
          headerIndex = i;
          break;
        }
      }

      if (headerIndex === -1) {
        console.warn(`No se encontró cabecera válida en el archivo: ${file}. Saltando...`);
        continue;
      }

      const headerLine = lines[headerIndex].trim().split(';');
      const header = headerLine.map(h => h.trim().toUpperCase());
      
      const colMap = {
        lab: header.indexOf('LABORATORIO TITULAR'),
        comercial: header.indexOf('NOMBRE COMERCIAL'),
        generico: header.findIndex(h => h.includes('GENERICO')),
        presentacion: header.indexOf('PRESENTACION'),
      };

      if (colMap.lab === -1 || colMap.comercial === -1 || colMap.generico === -1) {
          console.warn(`Columnas esenciales no encontradas en ${file}. Saltando...`);
          continue;
      }

      const dataLines = lines.slice(headerIndex + 1);

      for (const line of dataLines) {
        const values = line.split(';');
        if (values.length < Math.max(colMap.lab, colMap.comercial, colMap.generico)) continue;

        const nombreGenerico = (values[colMap.generico] || '').trim().replace(/\"/g, '');
        const nombreComercial = (values[colMap.comercial] || '').trim().replace(/\"/g, '');

        if (nombreGenerico || nombreComercial) {
          allMedicamentos.push({
            id: nanoid(),
            nombreGenerico: nombreGenerico,
            nombreComercial: nombreComercial,
            laboratorio: (values[colMap.lab] || '').trim().replace(/\"/g, ''),
            presentacion: (values[colMap.presentacion] || '').trim().replace(/\"/g, ''),
            origen: 'anmat_csv',
          });
        }
      }
    }

    console.log(`Se encontraron un total de ${allMedicamentos.length} registros en los archivos.`);

    const uniqueMedicamentosMap = new Map();
    allMedicamentos.forEach(med => {
      const key = `${med.nombreGenerico}|${med.nombreComercial}|${med.presentacion}`.toLowerCase();
      if (!uniqueMedicamentosMap.has(key)) {
        uniqueMedicamentosMap.set(key, med);
      }
    });
    const uniqueMedicamentos = Array.from(uniqueMedicamentosMap.values());

    console.log(`Después de eliminar duplicados, quedan ${uniqueMedicamentos.length} registros únicos.`);

    if (uniqueMedicamentos.length > 0) {
      console.log('Insertando registros en la base de datos...');
      const chunkSize = 200;
      for (let i = 0; i < uniqueMedicamentos.length; i += chunkSize) {
        const chunk = uniqueMedicamentos.slice(i, i + chunkSize);
        await db.insert(vademecum).values(chunk).onConflictDoNothing();
        console.log(`Lote de ${chunk.length} registros insertado.`);
      }
      console.log('¡Proceso de inserción completado!');
    } else {
      console.log('No hay nuevos medicamentos para insertar.');
    }

  } catch (error) {
    console.error('Ocurrió un error durante el proceso de importación:', error);
    process.exit(1);
  } finally {
    console.log('Script finalizado.');
    process.exit(0);
  }
}

main();
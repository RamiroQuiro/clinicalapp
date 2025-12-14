import { createClient } from '@libsql/client';
import 'dotenv/config'; // Asegúrate de tener 'dotenv' instalado, o usa node --env-file=.env si es Node 20+
import { drizzle } from 'drizzle-orm/libsql';
import { nanoid } from 'nanoid';
import { planes } from '../schema/planes.ts';


// --- Configuración de DB independiente ---
const tursoUrl = process.env.TURSO_DB_URL;
const tursoToken = process.env.TURSO_DB_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DB_URL y TURSO_DB_AUTH_TOKEN son requeridos en .env');
    process.exit(1);
}

const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});

const db = drizzle(client);

// --- Datos Semilla ---
const planesSeed = [
    {
        nombre: 'Consultorio Digital',
        precioMensual: 25000,
        diasPrueba: 14,
        descripcion: 'Ideal para profesionales independientes. Gestiona tus turnos y pacientes sin complicaciones.',
        limites: JSON.stringify({
            maxProfesionales: 1,
            maxSecretarias: 1,
            iaEnabled: false,
            storageGB: 1,
            soporte: 'email',
        }),
        activo: true,
    },
    {
        nombre: 'Clínica Pro',
        precioMensual: 65000,
        diasPrueba: 20,
        descripcion: 'Para centros médicos en crecimiento. Suma equipo y potencia tu gestión.',
        limites: JSON.stringify({
            maxProfesionales: 5,
            maxSecretarias: 999,
            iaEnabled: true,
            iaFeatures: ['autocompletado'],
            storageGB: 10,
            soporte: 'whatsapp',
        }),
        activo: true,
    },
    {
        nombre: 'Institucional',
        precioMensual: 120000,
        diasPrueba: 20,
        descripcion: 'Solución integral para grandes instituciones con múltiples especialidades.',
        limites: JSON.stringify({
            maxProfesionales: 9999,
            maxSecretarias: 9999,
            iaEnabled: true,
            iaFeatures: ['autocompletado', 'transcripcion', 'analisis'],
            storageGB: 100,
            soporte: '24/7_prioritario',
        }),
        activo: true,
    },
];

async function main() {
    console.log('🌱 Iniciando seed de planes...');

    try {
        for (const plan of planesSeed) {
            console.log(`Insertando plan: ${plan.nombre}`);
            // Usamos nanoid para ID o dejamos que la lógica de negocio lo maneje. 
            // Aquí seteamos uno manual legible para testing o random
            await db.insert(planes).values({
                id: `plan_${nanoid(10)}`,
                ...plan,
            });
        }
        console.log('✅ Planes insertados correctamente!');
    } catch (e) {
        console.error('❌ Error insertando planes:', e);
    } finally {
        process.exit(0);
    }
}

main();
